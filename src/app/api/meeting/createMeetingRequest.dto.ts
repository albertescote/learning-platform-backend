import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateMeetingRequestDto {
  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(172800)
  expirationSeconds?: number;
}
