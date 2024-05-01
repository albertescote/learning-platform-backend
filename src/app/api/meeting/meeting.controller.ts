import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MeetingService } from '../../../context/meeting/service/meeting.service';
import { CreateMeetingResponseDto } from './createMeetingResponse.dto';
import { UpdateMeetingRequestDto } from './updateMeetingRequest.dto';
import { CreateMeetingRequestDto } from './createMeetingRequest.dto';
import { JwtAuthGuard } from '../../../context/auth/guards/jwt.guard';
import { MeetingResponseDto } from './meetingResponse.dto';
import { IdParamDto } from './idParam.dto';
import { UserAuthInfo } from '../../../context/shared/domain/userAuthInfo';

@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: CreateMeetingRequestDto,
  ): Promise<CreateMeetingResponseDto> {
    console.log('[POST /meeting]: request received');
    const response = await this.meetingService.create(body, req.user);
    console.log('[POST /meeting]: response sent');
    return response;
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  getById(@Param() idParamDto: IdParamDto): MeetingResponseDto {
    console.log(`[GET /meeting/${idParamDto.id}]: request received`);
    const response = this.meetingService.getById(idParamDto.id);
    console.log(`[GET /meeting/${idParamDto.id}]: response sent`);
    return response;
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  getAll(): MeetingResponseDto[] {
    console.log('[GET /meeting]: request received');
    const response = this.meetingService.getAll();
    console.log('[GET /meeting]: response sent');
    return response;
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async update(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
    @Body() body: UpdateMeetingRequestDto,
  ): Promise<MeetingResponseDto> {
    console.log(`[PUT /meeting/${idParamDto.id}]: request received`);
    const response = await this.meetingService.update(
      idParamDto.id,
      body,
      req.user,
    );
    console.log(`[PUT /meeting/${idParamDto.id}]: response sent`);
    return response;
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  delete(
    @Request() req: { user: UserAuthInfo },
    @Param() idParamDto: IdParamDto,
  ): void {
    console.log(`[DELETE /meeting/${idParamDto.id}]: request received`);
    this.meetingService.deleteById(idParamDto.id, req.user);
    console.log(`[DELETE /meeting/${idParamDto.id}]: response sent`);
    return;
  }
}
