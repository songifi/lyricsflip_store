import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Req } from "@nestjs/common"
import { AuthService } from "../providers/auth.service";
import { Public } from "src/common/decorators/public.decorator";
import { RegisterArtistDto } from "../dto/register-artist.dto";
import { LoginArtistDto } from "../dto/login-artist.dto";
import { TokensDto } from "../dto/tokens.dto";
import { VerifyEmailDto } from "../dto/verify-email.dto";
import { RefreshTokenGuard } from "src/common/guards/refresh-token.guard";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { GetCurrentArtist } from "src/common/decorators/get-current-artist.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerArtistDto: RegisterArtistDto): Promise<{ message: string }> {
    return this.authService.register(registerArtistDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginArtistDto: LoginArtistDto): Promise<TokensDto> {
    return this.authService.login(loginArtistDto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Public()
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Req() req): Promise<TokensDto> {
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentArtist('sub') artistId: string): Promise<{ message: string }> {
    return this.authService.logout(artistId);
  }
}
