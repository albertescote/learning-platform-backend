import { Test, TestingModule } from '@nestjs/testing';
import { MeetingService } from '../../../../src/context/meeting/service/meeting.service';
import { MeetingRepository } from '../../../../src/context/meeting/infrastructure/meetingRepository';
import RsaSigner from '../../../../src/context/shared/infrastructure/rsaSigner';
import { ModuleConnectors } from '../../../../src/context/shared/infrastructure/moduleConnectors';
import { WrongPermissionsException } from '../../../../src/context/meeting/exceptions/wrongPermissionsException';
import { NotAbleToExecuteMeetingDbTransactionException } from '../../../../src/context/meeting/exceptions/notAbleToExecuteMeetingDbTransactionException';
import UserId from '../../../../src/context/shared/domain/userId';
import MeetingId from '../../../../src/context/meeting/domain/meetingId';
import {
  ZOOM_MEETING_SDK_KEY,
  ZOOM_MEETING_SDK_SECRET,
} from '../../../../src/context/meeting/config';
import { SupportedAlgorithms } from '../../../../src/context/meeting/domain/supportedAlgorithms';
import { MeetingNotFoundException } from '../../../../src/context/meeting/exceptions/meetingNotFoundException';
import Meeting from '../../../../src/context/meeting/domain/meeting';
import { Role } from '../../../../src/context/shared/domain/role';

describe('MeetingService', () => {
  let service: MeetingService;
  let meetingRepository: MeetingRepository;
  let rsaSigner: RsaSigner;
  let moduleConnectors: ModuleConnectors;
  const userId = UserId.generate().toPrimitive();
  const meetingId = MeetingId.generate().toPrimitive();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        {
          provide: MeetingRepository,
          useValue: {
            addMeeting: jest.fn(),
            getMeetingById: jest.fn(),
            getAllMeetings: jest.fn(),
            updateMeeting: jest.fn(),
            deleteMeeting: jest.fn(),
          },
        },
        {
          provide: RsaSigner,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ModuleConnectors,
          useValue: {
            obtainUserInformation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MeetingService>(MeetingService);
    meetingRepository = module.get<MeetingRepository>(MeetingRepository);
    rsaSigner = module.get<RsaSigner>(RsaSigner);
    moduleConnectors = module.get<ModuleConnectors>(ModuleConnectors);
  });

  it('should create a meeting successfully', async () => {
    const request = { topic: 'Test Meeting', expirationSeconds: 3600 };
    const userAuthInfo = { email: 'teacher@example.com', id: userId };
    const user = { getRole: () => 'Teacher' };
    const meetingResponse = {
      id: MeetingId.generate().toPrimitive(),
      topic: 'Test Meeting',
      role: 'Teacher',
      signature: 'mockedSignature',
      ownerId: userId,
    };

    (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
      user,
    );
    (meetingRepository.addMeeting as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => meetingResponse,
    });
    (rsaSigner.sign as jest.Mock).mockReturnValueOnce('mockedSignature');

    const result = await service.create(request, userAuthInfo);

    expect(moduleConnectors.obtainUserInformation).toHaveBeenCalledWith(
      userAuthInfo.email,
    );
    expect(meetingRepository.addMeeting).toHaveBeenCalledWith(
      new Meeting(expect.any(MeetingId), 'Test Meeting', Role.Teacher, userId),
    );
    expect(rsaSigner.sign).toHaveBeenCalledWith({
      alg: SupportedAlgorithms.HS256,
      header: { alg: SupportedAlgorithms.HS256, typ: 'JWT' },
      payload: {
        app_key: ZOOM_MEETING_SDK_KEY,
        exp: expect.any(Number) as number,
        iat: expect.any(Number) as number,
        role_type: 1,
        tpc: 'Test Meeting',
        version: 1,
      },
      secret: ZOOM_MEETING_SDK_SECRET,
    });
    expect(result).toEqual(meetingResponse);
  });
  it('should throw WrongPermissionsException if user is not a teacher', async () => {
    const request = { topic: 'Test Meeting' };
    const userAuthInfo = { email: 'student@example.com', id: userId };
    const user = { getRole: () => 'Student' };

    (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
      user,
    );

    await expect(service.create(request, userAuthInfo)).rejects.toThrow(
      WrongPermissionsException,
    );
  });
  it('should throw NotAbleToExecuteMeetingDbTransactionException if meeting addition fails', async () => {
    const request = { topic: 'Test Meeting' };
    const userAuthInfo = { email: 'teacher@example.com', id: userId };
    const user = { getRole: () => 'Teacher' };

    (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
      user,
    );
    (meetingRepository.addMeeting as jest.Mock).mockReturnValueOnce(null);

    await expect(service.create(request, userAuthInfo)).rejects.toThrow(
      NotAbleToExecuteMeetingDbTransactionException,
    );
  });
  it('should return meeting by ID', () => {
    const meetingResponse = {
      id: meetingId,
      topic: 'Test Meeting',
      role: 'Teacher',
    };

    (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => meetingResponse,
    });

    const result = service.getById(meetingId);

    expect(meetingRepository.getMeetingById).toHaveBeenCalledWith(
      new MeetingId(meetingId),
    );
    expect(result).toEqual(meetingResponse);
  });
  it('should throw MeetingNotFoundException if meeting does not exist', () => {
    (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce(null);

    expect(() => service.getById(meetingId)).toThrow(MeetingNotFoundException);
  });
  it('should return all meetings', () => {
    const meetings = [
      { id: meetingId, topic: 'Meeting 1', role: 'Teacher' },
      {
        id: MeetingId.generate().toPrimitive(),
        topic: 'Meeting 2',
        role: 'Student',
      },
    ];

    (meetingRepository.getAllMeetings as jest.Mock).mockReturnValueOnce(
      meetings.map((meeting) => ({ toPrimitives: () => meeting })),
    );

    const result = service.getAll();

    expect(meetingRepository.getAllMeetings).toHaveBeenCalled();
    expect(result).toEqual(meetings);
  });
  it('should return an empty array if no meetings are found', () => {
    (meetingRepository.getAllMeetings as jest.Mock).mockReturnValueOnce([]);

    const result = service.getAll();

    expect(meetingRepository.getAllMeetings).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
  it('should update meeting successfully', () => {
    const request = { topic: 'Updated Meeting', expirationSeconds: 3600 };
    const userAuthInfo = { email: 'teacher@example.com', id: userId };
    const oldMeeting = {
      id: meetingId,
      topic: 'Old Meeting',
      role: 'Teacher',
      ownerId: userId,
    };
    const updatedMeeting = {
      id: meetingId,
      ...request,
      role: 'Teacher',
      ownerId: userId,
    };

    (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => oldMeeting,
    });
    (meetingRepository.updateMeeting as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => updatedMeeting,
    });

    const result = service.update(meetingId, request, userAuthInfo);

    expect(meetingRepository.getMeetingById).toHaveBeenCalledWith(
      new MeetingId(meetingId),
    );
    expect(meetingRepository.updateMeeting).toHaveBeenCalledWith(
      new MeetingId(meetingId),
      Meeting.fromPrimitives(updatedMeeting),
    );
    expect(result).toEqual(updatedMeeting);
  });
  it('should throw MeetingNotFoundException if meeting does not exist', () => {
    const request = { topic: 'Updated Meeting' };
    const userAuthInfo = { email: 'teacher@example.com', id: userId };

    (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce(null);

    expect(() => service.update(meetingId, request, userAuthInfo)).toThrow(
      MeetingNotFoundException,
    );
  });
  it('should throw WrongPermissionsException if user does not have permission to update', () => {
    const request = { topic: 'Updated Meeting' };
    const userAuthInfo = { email: 'student@example.com', id: userId };
    const oldMeeting = {
      id: meetingId,
      topic: 'Old Meeting',
      role: 'Teacher',
      ownerId: UserId.generate().toPrimitive(),
    };

    (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => oldMeeting,
    });

    expect(() => service.update(meetingId, request, userAuthInfo)).toThrow(
      WrongPermissionsException,
    );
  });
  it('should throw NotAbleToExecuteMeetingDbTransactionException if update fails', () => {
    const request = { topic: 'Updated Meeting' };
    const userAuthInfo = { email: 'teacher@example.com', id: userId };
    const oldMeeting = {
      id: meetingId,
      topic: 'Old Meeting',
      role: 'Teacher',
      ownerId: userId,
    };

    (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => oldMeeting,
    });
    (meetingRepository.updateMeeting as jest.Mock).mockReturnValueOnce(null);

    expect(() => service.update(meetingId, request, userAuthInfo)).toThrow(
      NotAbleToExecuteMeetingDbTransactionException,
    );
  });
  it('should delete meeting successfully', () => {
    const userAuthInfo = { email: 'teacher@example.com', id: userId };
    const oldMeeting = {
      id: meetingId,
      topic: 'Old Meeting',
      role: 'Teacher',
      ownerId: userId,
    };

    (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => oldMeeting,
    });
    (meetingRepository.deleteMeeting as jest.Mock).mockReturnValueOnce(true);

    expect(() => service.deleteById(meetingId, userAuthInfo)).not.toThrow();
    expect(meetingRepository.getMeetingById).toHaveBeenCalledWith(
      new MeetingId(meetingId),
    );
    expect(meetingRepository.deleteMeeting).toHaveBeenCalledWith(
      new MeetingId(meetingId),
    );
  });
  it('should throw MeetingNotFoundException if meeting does not exist', () => {
    const userAuthInfo = { email: 'teacher@example.com', id: userId };

    (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce(null);

    expect(() => service.deleteById(meetingId, userAuthInfo)).toThrow(
      MeetingNotFoundException,
    );
  });
  it('should throw WrongPermissionsException if user does not have permission to delete', () => {
    const userAuthInfo = { email: 'student@example.com', id: userId };
    const oldMeeting = {
      id: meetingId,
      topic: 'Old Meeting',
      role: 'Teacher',
      ownerId: UserId.generate().toPrimitive(),
    };

    (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => oldMeeting,
    });

    expect(() => service.deleteById(meetingId, userAuthInfo)).toThrow(
      WrongPermissionsException,
    );
  });
  it('should throw NotAbleToExecuteMeetingDbTransactionException if delete fails', () => {
    const userAuthInfo = { email: 'teacher@example.com', id: userId };
    const oldMeeting = {
      id: meetingId,
      topic: 'Old Meeting',
      role: 'Teacher',
      ownerId: userId,
    };

    (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => oldMeeting,
    });
    (meetingRepository.deleteMeeting as jest.Mock).mockReturnValueOnce(false);

    expect(() => service.deleteById(meetingId, userAuthInfo)).toThrow(
      NotAbleToExecuteMeetingDbTransactionException,
    );
  });
});
