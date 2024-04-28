import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SignatureService } from '../../../context/signature/service/signature.service';
import SignatureRequestDto from './signatureRequest.dto';
import { SignatureResponseDto } from './signatureResponse.dto';

@Controller('signature')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Post('/')
  @HttpCode(201)
  signature(@Body() body: SignatureRequestDto): SignatureResponseDto {
    console.log('[POST /signature]: request received');
    const response = this.signatureService.signature(body);
    console.log('[POST /signature]: response sent');
    return response;
  }
}
