import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(`Not Found - ${message}`, HttpStatus.NOT_FOUND);
  }
}
