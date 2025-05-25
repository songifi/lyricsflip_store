export class CreateChartEntryDto {
  @IsInt()
  trackId: number;

  @IsInt()
  artistId: number;

  @IsString()
  metric: string;

  @IsNumber()
  value: number;

  @IsDateString()
  date: Date;
}
