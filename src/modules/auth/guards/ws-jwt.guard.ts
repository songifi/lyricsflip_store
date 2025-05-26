import { Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import { WsException } from "@nestjs/websockets"

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient()
      const token = this.extractTokenFromHandshake(client)

      if (!token) {
        throw new WsException("Unauthorized")
      }

      const payload = await this.jwtService.verifyAsync(token)
      client.user = payload
      return true
    } catch (error) {
      throw new WsException("Unauthorized")
    }
  }

  private extractTokenFromHandshake(client: any): string | null {
    const token = client.handshake?.auth?.token || client.handshake?.headers?.authorization?.replace("Bearer ", "")
    return token || null
  }
}
