import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export default class SignatureMeetingRequestDto {
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

  @IsNotEmpty()
  @IsNumber()
  meetingNumber: number;
}
