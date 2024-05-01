import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(`Unauthorized - ${message}`, HttpStatus.UNAUTHORIZED);
  }
}
