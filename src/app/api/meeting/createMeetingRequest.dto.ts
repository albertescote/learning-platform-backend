import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMeetingRequestDto {
  @IsNotEmpty()
  @IsString()
  topic: string;
}
