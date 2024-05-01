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
    email: string,
  ): Promise<CreateMeetingResponse> {
    const user = await this.moduleConnectors.obtainUserInformation(email);
    const parsedRole = user.getRole();
    if (parsedRole !== Role.Teacher) {
      throw new Error('unauthorized: you are not able to create a meeting');
    }
    const meeting = new Meeting(
      MeetingId.generate(),
      request.topic,
      parsedRole,
    );
    const storedMeeting = this.meetingRepository.addMeeting(meeting);
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
      throw new Error('meeting not found');
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
    email: string,
  ): Promise<MeetingResponse> {
    const user = await this.moduleConnectors.obtainUserInformation(email);
    if (user.getRole() !== Role.Teacher) {
      throw new Error('unauthorized: you are not able to create a meeting');
    }
    const updatedMeeting = this.meetingRepository.updateMeeting(
      new MeetingId(id),
      Meeting.fromPrimitives({
        ...request,
        id,
        role: user.getRole(),
      }),
    );
    if (!updatedMeeting) {
      throw new Error('meeting not found');
    }
    return updatedMeeting.toPrimitives();
  }

  deleteById(id: string): void {
    const deleted = this.meetingRepository.deleteMeeting(new MeetingId(id));
    if (!deleted) {
      throw new Error(`unable to delete this meeting: ${id}`);
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
