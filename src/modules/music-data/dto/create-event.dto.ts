export class CreateEventDto {
  @IsString()
  source: string;

  @IsString()
  event_type: string;

  @IsObject()
  data: Record<string, any>;
}
