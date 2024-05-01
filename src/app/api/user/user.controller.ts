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
import { UserResponseDto } from './userResponse.dto';
import { UpdateUserRequestDto } from './updateUserRequest.dto';
import { CreateUserRequestDto } from './createUserRequest.dto';
import { UserService } from '../../../context/user/service/user.service';
import { IdParamDto } from './idParam.dto';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  @HttpCode(201)
  async create(@Body() body: CreateUserRequestDto): Promise<UserResponseDto> {
    console.log('[POST /user]: request received');
    const response = await this.userService.create(body);
    console.log('[POST /user]: response sent');
    return response;
  }

  @Get('/:id')
  @HttpCode(200)
  getById(@Param() idParamDto: IdParamDto): UserResponseDto {
    console.log(`[GET /user/${idParamDto.id}]: request received`);
    const response = this.userService.getById(idParamDto.id);
    console.log(`[GET /user/${idParamDto.id}]: response sent`);
    return response;
  }

  @Get('/')
  @HttpCode(200)
  getAll(): UserResponseDto[] {
    console.log('[GET /user]: request received');
    const response = this.userService.getAll();
    console.log('[GET /user]: response sent');
    return response;
  }

  @Put('/:id')
  @HttpCode(200)
  update(
    @Param() idParamDto: IdParamDto,
    @Body() body: UpdateUserRequestDto,
  ): UserResponseDto {
    console.log(`[PUT /user/${idParamDto.id}]: request received`);
    const response = this.userService.update(idParamDto.id, body);
    console.log(`[PUT /user/${idParamDto.id}]: response sent`);
    return response;
  }

  @Delete('/:id')
  @HttpCode(204)
  delete(@Param() idParamDto: IdParamDto): void {
    console.log(`[DELETE /user/${idParamDto.id}]: request received`);
    this.userService.deleteById(idParamDto.id);
    console.log(`[DELETE /user/${idParamDto.id}]: response sent`);
    return;
  }
}
