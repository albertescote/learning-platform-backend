import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MeetingService } from '../../../context/meeting/service/meeting.service';
import { MeetingResponseDto } from './meetingResponse.dto';
import { UpdateMeetingRequestDto } from './updateMeetingRequest.dto';
import { CreateMeetingRequestDto } from './createMeetingRequest.dto';

@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('/')
  @HttpCode(201)
  create(@Body() body: CreateMeetingRequestDto): MeetingResponseDto {
    console.log('[POST /meeting]: request received');
    const response = this.meetingService.create(body);
    console.log('[POST /meeting]: response sent');
    return response;
  }

  @Get('/:id')
  @HttpCode(200)
  getById(@Param('id') id: string): MeetingResponseDto {
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

  @Put('/:id')
  @HttpCode(200)
  update(
    @Param('id') id: string,
    @Body() body: UpdateMeetingRequestDto,
  ): MeetingResponseDto {
    console.log(`[PUT /meeting/${id}]: request received`);
    const response = this.meetingService.update(id, body);
    console.log(`[PUT /meeting/${id}]: response sent`);
    return response;
  }

  @Delete('/:id')
  @HttpCode(204)
  delete(@Param('id') id: string): void {
    console.log(`[DELETE /meeting/${id}]: request received`);
    this.meetingService.deleteById(id);
    console.log(`[DELETE /meeting/${id}]: response sent`);
    return;
  }
}
