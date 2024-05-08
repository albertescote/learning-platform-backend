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
import { MeetingResponseDto } from './meetingResponse.dto';
import { IdParamDto } from './idParam.dto';
import { UserAuthInfo } from '../../../context/shared/domain/userAuthInfo';
import { JwtCustomGuard } from '../../../context/auth/guards/jwt-custom.guard';

@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('/')
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: CreateMeetingRequestDto,
  ): Promise<CreateMeetingResponseDto> {
    return await this.meetingService.create(body, req.user);
  }

  @Get('/:id')
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  getById(@Param() idParamDto: IdParamDto): MeetingResponseDto {
    return this.meetingService.getById(idParamDto.id);
  }

  @Get('/')
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  getAll(): MeetingResponseDto[] {
    return this.meetingService.getAll();
  }

  @Put('/:id')
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
    @Body() body: UpdateMeetingRequestDto,
  ): Promise<MeetingResponseDto> {
    return await this.meetingService.update(idParamDto.id, body, req.user);
  }

  @Delete('/:id')
  @UseGuards(JwtCustomGuard)
  @HttpCode(204)
  delete(
    @Request() req: { user: UserAuthInfo },
    @Param() idParamDto: IdParamDto,
  ): void {
    this.meetingService.deleteById(idParamDto.id, req.user);
    return;
  }
}
