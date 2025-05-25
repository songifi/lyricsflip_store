import { SetMetadata } from "@nestjs/common"

export const MODERATION_PERMISSION_KEY = "moderationPermission"
export const ModerationPermission = (permission: string) => SetMetadata(MODERATION_PERMISSION_KEY, permission)
