import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ReviewVerificationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    const { contentType, contentId } = request.body;

    // TODO: Implement real verification logic:
    // For example, check if the user purchased the merch or attended the event or listened to album/track
    // Stub: For demo, allow all
    const verified = true;

    if (!verified) {
      throw new ForbiddenException('You must be a verified purchaser or attendee to submit a review');
    }
    return true;
  }
}
