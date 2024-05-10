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
import User from '../../../../src/context/shared/domain/user';
import { InvalidStudentIdException } from '../../../../src/context/meeting/exceptions/invalidStudentIdException';
import { InvalidRoleForRequestedStudentException } from '../../../../src/context/meeting/exceptions/invalidRoleForRequestedStudentException';

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

  describe('for create meeting method', () => {
    it('should create a meeting successfully', async () => {
      const request = {
        topic: 'Test Meeting',
        studentId: UserId.generate().toPrimitive(),
        expirationSeconds: 3600,
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      const owner = { getRole: () => 'Teacher' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(owner);
      const student = new User(
        new UserId(request.studentId),
        'John',
        'Doe',
        'student@example.com',
        '123456789',
        Role.Student,
      );
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(student);
      const meetingResponse = {
        id: MeetingId.generate().toPrimitive(),
        topic: 'Test Meeting',
        role: 'Teacher',
        signature: 'mockedSignature',
        ownerId: userId,
      };
      (meetingRepository.addMeeting as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => meetingResponse,
      });
      (rsaSigner.sign as jest.Mock).mockReturnValueOnce('mockedSignature');

      const result = await service.create(request, userAuthInfo);

      expect(moduleConnectors.obtainUserInformation).toHaveBeenNthCalledWith(
        1,
        userAuthInfo.id,
      );
      expect(moduleConnectors.obtainUserInformation).toHaveBeenNthCalledWith(
        2,
        request.studentId,
      );
      expect(meetingRepository.addMeeting).toHaveBeenCalledWith(
        new Meeting(
          expect.any(MeetingId),
          'Test Meeting',
          Role.Teacher,
          new UserId(userId),
          new UserId(request.studentId),
        ),
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
      const request = {
        topic: 'Test Meeting',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Student,
      };
      const user = { getRole: () => 'Student' };

      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        user,
      );

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(WrongPermissionsException);
    });
    it('should throw InvalidStudentIdException if the student does not exists', async () => {
      const request = {
        topic: 'Test Meeting',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Student,
      };
      const owner = { getRole: () => 'Teacher' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(owner);
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(undefined);

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(InvalidStudentIdException);
    });
    it('should throw InvalidRoleForRequestedStudentException if the student does not have the role of student', async () => {
      const request = {
        topic: 'Test Meeting',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Student,
      };
      const owner = { getRole: () => 'Teacher' };
      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        owner,
      );
      const student = { getRole: () => 'Teacher' };
      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        student,
      );

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(InvalidRoleForRequestedStudentException);
    });
    it('should throw NotAbleToExecuteMeetingDbTransactionException if meeting addition fails', async () => {
      const request = {
        topic: 'Test Meeting',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      const owner = { getRole: () => 'Teacher' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(owner);
      const student = { getRole: () => 'Student' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(student);
      (meetingRepository.addMeeting as jest.Mock).mockReturnValueOnce(null);

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(NotAbleToExecuteMeetingDbTransactionException);
    });
  });
  describe('for getById meeting method', () => {
    it('should return meeting by ID', () => {
      const meetingResponse = {
        id: meetingId,
        topic: 'Test Meeting',
        role: 'Teacher',
        ownerId: userId,
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };

      (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => meetingResponse,
      });

      const result = service.getById(meetingId, userAuthInfo);

      expect(meetingRepository.getMeetingById).toHaveBeenCalledWith(
        new MeetingId(meetingId),
      );
      expect(result).toEqual(meetingResponse);
    });
    it('should throw MeetingNotFoundException if meeting does not exist', () => {
      (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce(null);
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };

      expect(() => service.getById(meetingId, userAuthInfo)).toThrow(
        MeetingNotFoundException,
      );
    });
    it('should throw WrongPermissionsException if meeting does not exist', () => {
      const meetingResponse = {
        id: meetingId,
        topic: 'Test Meeting',
        role: 'Teacher',
        ownerId: UserId.generate().toPrimitive(),
        studentId: UserId.generate().toPrimitive(),
      };
      (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => meetingResponse,
      });
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };

      expect(() => service.getById(meetingId, userAuthInfo)).toThrow(
        WrongPermissionsException,
      );
    });
  });
  describe('for getAll meeting methods', () => {
    it('should return all meetings', () => {
      const meetings = [
        {
          id: meetingId,
          topic: 'Meeting 1',
          role: 'Teacher',
          ownerId: userId,
          studentId: UserId.generate().toPrimitive(),
        },
        {
          id: MeetingId.generate().toPrimitive(),
          topic: 'Meeting 2',
          role: 'Teacher',
          ownerId: userId,
          studentId: UserId.generate().toPrimitive(),
        },
      ];
      (meetingRepository.getAllMeetings as jest.Mock).mockReturnValueOnce(
        meetings.map((meeting) => ({ toPrimitives: () => meeting })),
      );
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };

      const result = service.getAll(userAuthInfo);

      expect(meetingRepository.getAllMeetings).toHaveBeenCalled();
      expect(result).toEqual(meetings);
    });
    it('should return an empty array if no meetings are found', () => {
      (meetingRepository.getAllMeetings as jest.Mock).mockReturnValueOnce([]);
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };

      const result = service.getAll(userAuthInfo);

      expect(meetingRepository.getAllMeetings).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
  describe('for update meeting method', () => {
    it('should update meeting successfully', async () => {
      const request = {
        topic: 'Updated Meeting',
        studentId: UserId.generate().toPrimitive(),
        expirationSeconds: 3600,
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      const oldMeeting = {
        id: meetingId,
        topic: 'Old Meeting',
        role: 'Teacher',
        ownerId: userId,
        studentId: UserId.generate().toPrimitive(),
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
      const student = new User(
        new UserId(request.studentId),
        'John',
        'Doe',
        'student@example.com',
        '123456789',
        Role.Student,
      );
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(student);
      (meetingRepository.updateMeeting as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => updatedMeeting,
      });

      const result = await service.update(meetingId, request, userAuthInfo);

      expect(meetingRepository.getMeetingById).toHaveBeenCalledWith(
        new MeetingId(meetingId),
      );
      expect(meetingRepository.updateMeeting).toHaveBeenCalledWith(
        new MeetingId(meetingId),
        Meeting.fromPrimitives(updatedMeeting),
      );
      expect(result).toEqual(updatedMeeting);
    });
    it('should throw MeetingNotFoundException if meeting does not exist', async () => {
      const request = {
        topic: 'Updated Meeting',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };

      (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce(null);

      await expect(
        async () => await service.update(meetingId, request, userAuthInfo),
      ).rejects.toThrow(MeetingNotFoundException);
    });
    it('should throw WrongPermissionsException if user does not have permission to update', async () => {
      const request = {
        topic: 'Updated Meeting',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      const oldMeeting = {
        id: meetingId,
        topic: 'Old Meeting',
        role: 'Teacher',
        ownerId: UserId.generate().toPrimitive(),
        studentId: UserId.generate().toPrimitive(),
      };
      (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldMeeting,
      });

      await expect(
        async () => await service.update(meetingId, request, userAuthInfo),
      ).rejects.toThrow(WrongPermissionsException);
    });
    it('should throw InvalidStudentIdException if the student does not exists', async () => {
      const request = {
        topic: 'Test Meeting',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Student,
      };
      const oldMeeting = {
        id: meetingId,
        topic: 'Old Meeting',
        role: 'Teacher',
        ownerId: userId,
        studentId: UserId.generate().toPrimitive(),
      };
      (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldMeeting,
      });
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(undefined);

      await expect(
        async () => await service.update(meetingId, request, userAuthInfo),
      ).rejects.toThrow(InvalidStudentIdException);
    });
    it('should throw InvalidRoleForRequestedStudentException if the student does not have the role of student', async () => {
      const request = {
        topic: 'Test Meeting',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Student,
      };
      const oldMeeting = {
        id: meetingId,
        topic: 'Old Meeting',
        role: 'Teacher',
        ownerId: userId,
        studentId: UserId.generate().toPrimitive(),
      };
      (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldMeeting,
      });
      const student = { getRole: () => 'Teacher' };
      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        student,
      );

      await expect(
        async () => await service.update(meetingId, request, userAuthInfo),
      ).rejects.toThrow(InvalidRoleForRequestedStudentException);
    });
    it('should throw NotAbleToExecuteMeetingDbTransactionException if update fails', async () => {
      const request = {
        topic: 'Updated Meeting',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      const oldMeeting = {
        id: meetingId,
        topic: 'Old Meeting',
        role: 'Teacher',
        ownerId: userId,
      };
      const student = new User(
        new UserId(request.studentId),
        'John',
        'Doe',
        'student@example.com',
        '123456789',
        Role.Student,
      );
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(student);
      (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldMeeting,
      });
      (meetingRepository.updateMeeting as jest.Mock).mockReturnValueOnce(null);

      await expect(
        async () => await service.update(meetingId, request, userAuthInfo),
      ).rejects.toThrow(NotAbleToExecuteMeetingDbTransactionException);
    });
  });
  describe('for delete meeting method', () => {
    it('should delete meeting successfully', () => {
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
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
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      (meetingRepository.getMeetingById as jest.Mock).mockReturnValueOnce(null);

      expect(() => service.deleteById(meetingId, userAuthInfo)).toThrow(
        MeetingNotFoundException,
      );
    });
    it('should throw WrongPermissionsException if user does not have permission to delete', () => {
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
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
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
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
});
