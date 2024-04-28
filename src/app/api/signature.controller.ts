import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SignatureService } from '../../context/signature/service/signature.service';
import SignatureRequestDto from './signatureRequest.dto';
import { SignatureResponseDto } from './signatureResponse.dto';

@Controller()
export class SignatureController {
  constructor(private readonly appService: SignatureService) {}

  @Post('signature')
  @HttpCode(201)
  signature(@Body() body: SignatureRequestDto): SignatureResponseDto {
    return this.appService.signature(body);
  }
}
