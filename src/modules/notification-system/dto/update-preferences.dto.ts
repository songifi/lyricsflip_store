export class UpdatePreferencesDto {
  userId: string;
  push: boolean;
  email: boolean;
  enabledTypes: string[];
}