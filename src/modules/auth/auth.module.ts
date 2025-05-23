import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PassportModule } from "@nestjs/passport"
import { ConfigModule } from "@nestjs/config"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy"
import { Artist } from "../artists/entities/artist.entity"
import { AuthController } from "./controllers/auth.controller"
import { AuthService } from "./providers/auth.service"
import { MailService } from "../notifications/providers/mail.service"

@Module({
  imports: [TypeOrmModule.forFeature([Artist]), PassportModule, JwtModule.register({}), ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, MailService],
  exports: [AuthService],
})
export class AuthModule {}
