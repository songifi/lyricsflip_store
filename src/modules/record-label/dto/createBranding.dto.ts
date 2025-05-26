import { IsString, IsEnum, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class CreateBrandingDto {
  @IsString()
  name: string;

  @IsEnum(['logo', 'color_palette', 'typography', 'template', 'asset'])
  type: string;

  @IsObject()
  config: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  usage?: {
    platforms?: string[];
    contexts?: string[];
    restrictions?: string[];
  };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}