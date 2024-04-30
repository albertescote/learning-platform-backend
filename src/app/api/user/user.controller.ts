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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  @HttpCode(201)
  create(@Body() body: CreateUserRequestDto): UserResponseDto {
    console.log('[POST /user]: request received');
    const response = this.userService.create(body);
    console.log('[POST /user]: response sent');
    return response;
  }

  @Get('/:id')
  @HttpCode(200)
  getById(@Param('id') id: string): UserResponseDto {
    console.log(`[GET /user/${id}]: request received`);
    const response = this.userService.getById(id);
    console.log(`[GET /user/${id}]: response sent`);
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
    @Param('id') id: string,
    @Body() body: UpdateUserRequestDto,
  ): UserResponseDto {
    console.log(`[PUT /user/${id}]: request received`);
    const response = this.userService.update(id, body);
    console.log(`[PUT /user/${id}]: response sent`);
    return response;
  }

  @Delete('/:id')
  @HttpCode(204)
  delete(@Param('id') id: string): void {
    console.log(`[DELETE /user/${id}]: request received`);
    this.userService.deleteById(id);
    console.log(`[DELETE /user/${id}]: response sent`);
    return;
  }
}
