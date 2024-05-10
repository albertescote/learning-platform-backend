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
import UserId from '../../shared/domain/userId';
import { InvalidStudentIdException } from '../exceptions/invalidStudentIdException';
import { InvalidRoleForRequestedStudentException } from '../exceptions/invalidRoleForRequestedStudentException';

export interface MeetingRequest {
  topic: string;
  studentId: string;
  expirationSeconds?: number;
}

export interface CreateMeetingResponse {
  id: string;
  topic: string;
  studentId: string;
  signature: string;
}

export interface MeetingResponse {
  id: string;
  topic: string;
  studentId: string;
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
    const owner = await this.moduleConnectors.obtainUserInformation(
      userAuthInfo.id,
    );
    const ownerParsedRole = owner.getRole();
    if (ownerParsedRole !== Role.Teacher) {
      throw new WrongPermissionsException('create meeting');
    }
    await this.checkStudent(request.studentId);
    const meeting = new Meeting(
      MeetingId.generate(),
      request.topic,
      new UserId(userAuthInfo.id),
      new UserId(request.studentId),
    );
    const storedMeeting = this.meetingRepository.addMeeting(meeting);
    if (!storedMeeting) {
      throw new NotAbleToExecuteMeetingDbTransactionException(`store meeting`);
    }
    return {
      ...storedMeeting.toPrimitives(),
      signature: this.signature(
        request.topic,
        ownerParsedRole,
        request.expirationSeconds,
      ),
    };
  }

  getById(id: string, userAuthInfo: UserAuthInfo): MeetingResponse {
    const storedMeeting = this.meetingRepository.getMeetingById(
      new MeetingId(id),
    );
    if (!storedMeeting) {
      throw new MeetingNotFoundException(id);
    }
    if (
      storedMeeting.toPrimitives().ownerId !== userAuthInfo.id &&
      storedMeeting.toPrimitives().studentId !== userAuthInfo.id
    ) {
      throw new WrongPermissionsException('get meeting');
    }
    if (storedMeeting) return storedMeeting.toPrimitives();
  }

  getAll(userAuthInfo: UserAuthInfo): MeetingResponse[] {
    const meetings = this.meetingRepository.getAllMeetings();
    if (userAuthInfo.role === Role.Teacher) {
      return this.getTeacherMeetings(meetings, userAuthInfo.id) ?? [];
    }
    if (userAuthInfo.role === Role.Student) {
      return this.getStudentMeetings(meetings, userAuthInfo.id) ?? [];
    }
    return [];
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
    if (request.studentId !== oldMeeting.toPrimitives().studentId) {
      await this.checkStudent(request.studentId);
    }
    const updatedMeeting = this.meetingRepository.updateMeeting(
      new MeetingId(id),
      Meeting.fromPrimitives({
        ...request,
        id,
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

  private getTeacherMeetings(
    meetings: Meeting[],
    userId: string,
  ): MeetingResponse[] {
    return meetings
      .filter((meeting) => meeting.toPrimitives().ownerId === userId)
      .map((meeting) => meeting.toPrimitives());
  }

  private getStudentMeetings(
    meetings: Meeting[],
    userId: string,
  ): MeetingResponse[] {
    return meetings
      .filter((meeting) => meeting.toPrimitives().studentId === userId)
      .map((meeting) => meeting.toPrimitives());
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

  private async checkStudent(studentId: string) {
    const student =
      await this.moduleConnectors.obtainUserInformation(studentId);
    if (!student) {
      throw new InvalidStudentIdException(studentId);
    }
    if (student.getRole() !== Role.Student) {
      throw new InvalidRoleForRequestedStudentException(studentId);
    }
  }
}
