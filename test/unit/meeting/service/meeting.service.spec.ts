import { MeetingService } from '../../../../src/context/meeting/service/meeting.service';
import { MeetingRepository } from '../../../../src/context/meeting/infrastructure/meetingRepository';
import { mock } from 'jest-mock-extended';
import Meeting from '../../../../src/context/meeting/domain/meeting';
import MeetingId from '../../../../src/context/meeting/domain/meetingId';
import { Role } from '../../../../src/context/shared/domain/role';
import RsaSigner from '../../../../src/context/shared/infrastructure/rsaSigner';
import { ModuleConnectors } from '../../../../src/context/shared/infrastructure/moduleConnectors';

describe('Meeting Service should', () => {
  const meetingRepositoryMock = mock<MeetingRepository>();
  const rsaSigner = new RsaSigner();
  const moduleConnectors = mock<ModuleConnectors>();
  const meetingService = new MeetingService(
    meetingRepositoryMock,
    rsaSigner,
    moduleConnectors,
  );

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('create a new meeting', async () => {
    const expectedRepositoryReturnValue: Meeting = new Meeting(
      MeetingId.generate(),
      'topic',
      Role.Teacher,
    );
    meetingRepositoryMock.addMeeting.mockReturnValue(
      expectedRepositoryReturnValue,
    );

    const newMeeting = await meetingService.create(
      { topic: 'topic' },
      'email@test.com',
    );

    expect(newMeeting.id).toStrictEqual(
      expectedRepositoryReturnValue.toPrimitives().id,
    );
    expect(meetingRepositoryMock.addMeeting).toHaveBeenCalled();
  });
  it('get a meeting by id', () => {
    const expectedRepositoryReturnValue: Meeting = new Meeting(
      MeetingId.generate(),
      'topic',
      Role.Student,
    );
    meetingRepositoryMock.getMeetingById.mockReturnValue(
      expectedRepositoryReturnValue,
    );

    const meeting = meetingService.getById(
      expectedRepositoryReturnValue.toPrimitives().id,
    );

    expect(meeting.id).toStrictEqual(
      expectedRepositoryReturnValue.toPrimitives().id,
    );
    expect(meetingRepositoryMock.getMeetingById).toHaveBeenCalledWith(
      new MeetingId(expectedRepositoryReturnValue.toPrimitives().id),
    );
  });
  it('get all meetings', () => {
    const newMeeting: Meeting = new Meeting(
      MeetingId.generate(),
      'topic',
      Role.Teacher,
    );
    const expectedRepositoryReturnValue = [newMeeting];
    meetingRepositoryMock.getAllMeetings.mockReturnValue(
      expectedRepositoryReturnValue,
    );

    const allMeetings = meetingService.getAll();

    expect(allMeetings.length).toStrictEqual(1);
    expect(allMeetings[0].id).toStrictEqual(newMeeting.toPrimitives().id);
    expect(meetingRepositoryMock.getAllMeetings).toHaveBeenCalled();
  });
  it('update a meeting', async () => {
    const expectedRepositoryReturnValue: Meeting = new Meeting(
      MeetingId.generate(),
      'topic',
      Role.Teacher,
    );
    meetingRepositoryMock.updateMeeting.mockReturnValue(
      expectedRepositoryReturnValue,
    );

    const meeting = await meetingService.update(
      expectedRepositoryReturnValue.toPrimitives().id,
      expectedRepositoryReturnValue.toPrimitives(),
      'email@test.com',
    );

    expect(meeting.id).toStrictEqual(
      expectedRepositoryReturnValue.toPrimitives().id,
    );
    expect(meetingRepositoryMock.updateMeeting).toHaveBeenCalledWith(
      new MeetingId(expectedRepositoryReturnValue.toPrimitives().id),
      expectedRepositoryReturnValue,
    );
  });
  it('delete a meeting', () => {
    meetingRepositoryMock.deleteMeeting.mockReturnValue(true);

    const meetingId = MeetingId.generate();
    meetingService.deleteById(meetingId.toPrimitive());

    expect(meetingRepositoryMock.deleteMeeting).toHaveBeenCalledWith(meetingId);
  });
});
