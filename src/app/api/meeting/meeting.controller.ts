import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { MeetingService } from '../../../context/meeting/service/meeting.service';
import { MeetingResponseDto } from './meetingResponse.dto';

@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('/')
  @HttpCode(201)
  create(): MeetingResponseDto {
    console.log('[GET /meeting]: request received');
    const response = this.meetingService.create();
    console.log('[GET /meeting]: response sent');
    return response;
  }

  @Get('/:id')
  @HttpCode(200)
  getById(@Param('id') id: number): MeetingResponseDto {
    console.log(`[GET /meeting/${id}]: request received`);
    const response = this.meetingService.getById(id);
    console.log(`[GET /meeting/${id}]: response sent`);
    return response;
  }

  @Get('/')
  @HttpCode(200)
  getAll(): MeetingResponseDto[] {
    console.log('[GET /meeting]: request received');
    const response = this.meetingService.getAll();
    console.log('[GET /meeting]: response sent');
    return response;
  }
}
