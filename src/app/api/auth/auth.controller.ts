import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../../../context/auth/service/auth.service';
import { LocalAuthGuard } from '../../../context/auth/guards/local-auth.guard';
import { LoginResponseDto } from './loginResponse.dto';
import { UserInfoDtoPrimitives } from '../../../context/auth/domain/userInfoDto';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Request() req: { user: UserInfoDtoPrimitives },
  ): Promise<LoginResponseDto> {
    return this.authService.login(req.user);
  }
}
