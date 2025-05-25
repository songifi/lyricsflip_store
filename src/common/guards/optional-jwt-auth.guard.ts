import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any) {
    // Return user if authenticated, null if not
    // Don't throw error for unauthenticated requests
    return user || null
  }
}
