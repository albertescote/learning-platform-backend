import { HttpException, HttpStatus } from '@nestjs/common';

export class InternalServerErrorException extends HttpException {
  constructor(message: string) {
    super(
      `Internal Server Error - ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
