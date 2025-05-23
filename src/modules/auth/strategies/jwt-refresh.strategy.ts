import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import { Request } from "express"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(JwtStrategy, "jwt-refresh") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET"),
      passReqToCallback: true,
    } as StrategyOptions & { passReqToCallback: true }); 
  }

  async validate(req: Request, payload: any) {
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.replace("Bearer ", "") || "";

    return {
      ...payload,
      refreshToken,
    };
  }
}

