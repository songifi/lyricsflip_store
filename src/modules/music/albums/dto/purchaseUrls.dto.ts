import { IsOptional, IsUrl } from "class-validator";

export class PurchaseUrlsDto {
  @IsOptional()
  @IsUrl()
  bandcamp?: string;

  @IsOptional()
  @IsUrl()
  itunes?: string;

  @IsOptional()
  @IsUrl()
  amazon?: string;

  @IsOptional()
  @IsUrl()
  physical_store?: string;
}