import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import { ConfigService } from "@nestjs/config"
import { Artist } from "src/modules/artists/entities/artist.entity"
import { MailService } from "src/modules/notifications/providers/mail.service"
import { RegisterArtistDto } from "../dto/register-artist.dto"
import { LoginArtistDto } from "../dto/login-artist.dto"
import { TokensDto } from "../dto/tokens.dto"
import { VerifyEmailDto } from "../dto/verify-email.dto"

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
  ) {}

  async register(registerArtistDto: RegisterArtistDto): Promise<{ message: string }> {
    const { email, password } = registerArtistDto

    // Check if artist with this email already exists
    const existingArtist = await this.artistRepository.findOne({ where: { email } })
    if (existingArtist) {
      throw new ConflictException("Artist with this email already exists")
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password)

    // Create verification token
    const verificationToken = uuidv4()

    // Create new artist
    const artist = this.artistRepository.create({
      ...registerArtistDto,
      password: hashedPassword,
      verificationToken,
      isEmailVerified: false,
    })

    await this.artistRepository.save(artist)

    // Send verification email
    await this.sendVerificationEmail(artist.email, artist.name, verificationToken)

    return { message: "Artist registered successfully. Please verify your email." }
  }

  async login(loginArtistDto: LoginArtistDto): Promise<TokensDto> {
    const { email, password } = loginArtistDto

    // Find artist by email
    const artist = await this.artistRepository.findOne({ where: { email } })
    if (!artist) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // Check if email is verified
    if (!artist.isEmailVerified) {
      throw new UnauthorizedException("Please verify your email before logging in")
    }

    // Validate password
    const isPasswordValid = await this.validatePassword(password, artist.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // Generate tokens
    const tokens = await this.generateTokens(artist)

    // Update refresh token in database
    artist.refreshToken = await this.hashPassword(tokens.refreshToken)
    await this.artistRepository.save(artist)

    return tokens
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    const { token } = verifyEmailDto

    // Find artist by verification token
    const artist = await this.artistRepository.findOne({ where: { verificationToken: token } })
    if (!artist) {
      throw new BadRequestException("Invalid verification token")
    }

    // Update artist
    artist.isEmailVerified = true
    artist.verificationToken = undefined
    await this.artistRepository.save(artist)

    return { message: "Email verified successfully" }
  }

  async refreshTokens(refreshToken: string): Promise<TokensDto> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      })

      // Find artist by id
      const artist = await this.artistRepository.findOne({ where: { id: payload.sub } })
      if (!artist || !artist.refreshToken) {
        throw new UnauthorizedException("Invalid refresh token")
      }

      // Validate refresh token
      const isRefreshTokenValid = await bcrypt.compare(refreshToken, artist.refreshToken)
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException("Invalid refresh token")
      }

      // Generate new tokens
      const tokens = await this.generateTokens(artist)

      // Update refresh token in database
      artist.refreshToken = await this.hashPassword(tokens.refreshToken)
      await this.artistRepository.save(artist)

      return tokens
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token")
    }
  }

  async logout(artistId: string): Promise<{ message: string }> {
    // Find artist by id
    const artist = await this.artistRepository.findOne({ where: { id: artistId } })
    if (!artist) {
      throw new BadRequestException("Artist not found")
    }

    // Clear refresh token
    artist.refreshToken = undefined;
    await this.artistRepository.save(artist)

    return { message: "Logged out successfully" }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt()
    return bcrypt.hash(password, salt)
  }

  private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  private async generateTokens(artist: Artist): Promise<TokensDto> {
    const payload = { sub: artist.id, email: artist.email, role: artist.role }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        expiresIn: "15m",
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: "7d",
      }),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  private async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get<string>("FRONTEND_URL")}/verify-email?token=${token}`

    await this.mailService.sendMail({
      to: email,
      subject: "Verify your email",
      template: "email-verification",
      context: {
        name,
        verificationUrl,
      },
    })
  }
}
