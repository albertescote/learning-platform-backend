import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateMeetingRequestDto {
  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(172800)
  expirationSeconds?: number;
}
