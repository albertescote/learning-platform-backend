import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateMeetingRequestDto {
  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsNotEmpty()
  @IsUUID()
  studentId: string;
}
