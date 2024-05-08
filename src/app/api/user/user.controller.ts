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
import { UserResponseDto } from './userResponse.dto';
import { UpdateUserRequestDto } from './updateUserRequest.dto';
import { CreateUserRequestDto } from './createUserRequest.dto';
import { UserService } from '../../../context/user/service/user.service';
import { IdParamDto } from './idParam.dto';
import { UserAuthInfo } from '../../../context/shared/domain/userAuthInfo';
import { JwtCustomGuard } from '../../../context/auth/guards/jwt-custom.guard';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  @HttpCode(201)
  async create(@Body() body: CreateUserRequestDto): Promise<UserResponseDto> {
    return await this.userService.create(body);
  }

  @Get('/:id')
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  getById(@Param() idParamDto: IdParamDto): UserResponseDto {
    return this.userService.getById(idParamDto.id);
  }

  @Get('/')
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  getAll(): UserResponseDto[] {
    return this.userService.getAll();
  }

  @Put('/:id')
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  update(
    @Param() idParamDto: IdParamDto,
    @Body() body: UpdateUserRequestDto,
    @Request() req: { user: UserAuthInfo },
  ): UserResponseDto {
    return this.userService.update(idParamDto.id, body, req.user);
  }

  @Delete('/:id')
  @UseGuards(JwtCustomGuard)
  @HttpCode(204)
  delete(
    @Request() req: { user: UserAuthInfo },
    @Param() idParamDto: IdParamDto,
  ): void {
    this.userService.deleteById(idParamDto.id, req.user);
    return;
  }
}
