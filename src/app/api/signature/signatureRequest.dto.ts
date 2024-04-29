import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export default class SignatureRequestDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1)
  role: number;

  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(172800)
  expirationSeconds: number;

  @IsOptional()
  @IsNumber()
  meetingNumber?: number;

  @IsOptional()
  @IsString()
  topic?: string;
}
