import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ReviewModerationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    // Example: only users with role 'moderator' or 'admin' can moderate reviews
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      throw new ForbiddenException('You do not have permission to moderate reviews');
    }
    return true;
  }
}
