import { Injectable } from '@nestjs/common';
import Meeting from '../domain/meeting';
import MeetingId from '../domain/meetingId';
import { MeetingRepository } from '../infrastructure/meetingRepository';
import { SupportedAlgorithms } from '../domain/supportedAlgorithms';
import { ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET } from '../config';
import { Role } from '../../shared/domain/role';
import { VideoPayload } from '../domain/payload';
import { SignatureOptions } from '../domain/signatureOptions';
import RsaSigner from '../../shared/infrastructure/rsaSigner';
import { ModuleConnectors } from '../../shared/infrastructure/moduleConnectors';
import { UserAuthInfo } from '../../shared/domain/userAuthInfo';
import { WrongPermissionsException } from '../exceptions/wrongPermissionsException';
import { MeetingNotFoundException } from '../exceptions/meetingNotFoundException';
import { NotAbleToExecuteMeetingDbTransactionException } from '../exceptions/notAbleToExecuteMeetingDbTransactionException';

export interface MeetingRequest {
  topic: string;
  expirationSeconds?: number;
}

export interface CreateMeetingResponse {
  id: string;
  topic: string;
  role: string;
  signature: string;
}

export interface MeetingResponse {
  id: string;
  topic: string;
  role: string;
}

@Injectable()
export class MeetingService {
  constructor(
    private meetingRepository: MeetingRepository,
    private rsaSigner: RsaSigner,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async create(
    request: MeetingRequest,
    userAuthInfo: UserAuthInfo,
  ): Promise<CreateMeetingResponse> {
    const user = await this.moduleConnectors.obtainUserInformation(
      userAuthInfo.email,
    );
    const parsedRole = user.getRole();
    if (parsedRole !== Role.Teacher) {
      throw new WrongPermissionsException('create meeting');
    }
    const meeting = new Meeting(
      MeetingId.generate(),
      request.topic,
      parsedRole,
      userAuthInfo.id,
    );
    const storedMeeting = this.meetingRepository.addMeeting(meeting);
    if (!storedMeeting) {
      throw new NotAbleToExecuteMeetingDbTransactionException(`store meeting`);
    }
    return {
      ...storedMeeting.toPrimitives(),
      signature: this.signature(
        request.topic,
        parsedRole,
        request.expirationSeconds,
      ),
    };
  }

  getById(id: string): MeetingResponse {
    const storedMeeting = this.meetingRepository.getMeetingById(
      new MeetingId(id),
    );
    if (!storedMeeting) {
      throw new MeetingNotFoundException(id);
    }
    return storedMeeting.toPrimitives();
  }

  getAll(): MeetingResponse[] {
    const meetings = this.meetingRepository.getAllMeetings();
    return meetings.map((meeting) => {
      return meeting.toPrimitives();
    });
  }

  async update(
    id: string,
    request: MeetingRequest,
    userAuthInfo: UserAuthInfo,
  ): Promise<MeetingResponse> {
    const oldMeeting = this.meetingRepository.getMeetingById(new MeetingId(id));
    if (!oldMeeting) {
      throw new MeetingNotFoundException(id);
    }
    if (oldMeeting.toPrimitives().ownerId !== userAuthInfo.id) {
      throw new WrongPermissionsException('update meeting');
    }
    const updatedMeeting = this.meetingRepository.updateMeeting(
      new MeetingId(id),
      Meeting.fromPrimitives({
        ...request,
        id,
        role: Role.Teacher,
        ownerId: userAuthInfo.id,
      }),
    );
    if (!updatedMeeting) {
      throw new NotAbleToExecuteMeetingDbTransactionException(
        `update meeting (${id})`,
      );
    }
    return updatedMeeting.toPrimitives();
  }

  deleteById(id: string, userAuthInfo: UserAuthInfo): void {
    const oldMeeting = this.meetingRepository.getMeetingById(new MeetingId(id));
    if (!oldMeeting) {
      throw new MeetingNotFoundException(id);
    }
    if (oldMeeting.toPrimitives().ownerId !== userAuthInfo.id) {
      throw new WrongPermissionsException('delete meeting');
    }
    const deleted = this.meetingRepository.deleteMeeting(new MeetingId(id));
    if (!deleted) {
      throw new NotAbleToExecuteMeetingDbTransactionException(
        `delete meeting (${id})`,
      );
    }
    return;
  }

  private signature(
    topic: string,
    role: Role,
    expirationSeconds: number,
  ): string {
    const iat = Math.floor(Date.now() / 1000);
    const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2;
    const header = { alg: SupportedAlgorithms.HS256, typ: 'JWT' };
    const payload = {
      app_key: ZOOM_MEETING_SDK_KEY,
      role_type: role === Role.Student ? 0 : 1,
      tpc: topic,
      version: 1,
      iat,
      exp,
    } as VideoPayload;
    const signatureOptions: SignatureOptions = {
      alg: SupportedAlgorithms.HS256,
      header: header,
      payload: payload,
      secret: ZOOM_MEETING_SDK_SECRET,
    };
    return this.rsaSigner.sign(signatureOptions);
  }
}
