import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SignatureService } from '../../../context/signature/service/signature.service';
import { SignatureResponseDto } from './signatureResponse.dto';
import SignatureVideoRequestDto from './signatureVideoRequest.dto';
import SignatureMeetingRequestDto from './signatureMeetingRequest.dto';

@Controller('signature')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Post('/meeting')
  @HttpCode(201)
  signatureMeeting(
    @Body() body: SignatureMeetingRequestDto,
  ): SignatureResponseDto {
    console.log('[POST /signature/meeting]: request received');
    const response = this.signatureService.signatureMeeting(body);
    console.log('[POST /signature/meeting]: response sent');
    return response;
  }
  @Post('/video')
  @HttpCode(201)
  signatureVideo(@Body() body: SignatureVideoRequestDto): SignatureResponseDto {
    console.log('[POST /signature/video]: request received');
    const response = this.signatureService.signatureVideo(body);
    console.log('[POST /signature/video]: response sent');
    return response;
  }
}
