import { Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common"
import type { Reflector } from "@nestjs/core"
import type { ModerationService } from "../moderation.service"

@Injectable()
export class ModerationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moderationService: ModerationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      return false
    }

    // Check if user is a moderation team member
    return await this.moderationService.canModerate(user.id)
  }
}
