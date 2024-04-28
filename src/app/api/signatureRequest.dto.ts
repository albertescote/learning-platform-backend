import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export default class SignatureRequestDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1)
  role: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1800)
  @Max(172800)
  expirationSeconds: number;

  @IsNotEmpty()
  @IsNumber()
  meetingNumber: number;
}
