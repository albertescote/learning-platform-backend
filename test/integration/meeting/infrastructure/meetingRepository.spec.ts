import { MeetingRepository } from '../../../../src/context/meeting/infrastructure/meetingRepository';
import Meeting from '../../../../src/context/meeting/domain/meeting';
import MeetingId from '../../../../src/context/meeting/domain/meetingId';
import { Role } from '../../../../src/context/shared/domain/role';

describe('Meeting Repository should', () => {
  const meetingRepository = new MeetingRepository();

  it('CRUD for meeting object', () => {
    const newMeeting: Meeting = new Meeting(
      MeetingId.generate(),
      'topic',
      Role.Student,
    );

    const addedMeeting = meetingRepository.addMeeting(newMeeting);

    expect(addedMeeting).toStrictEqual(newMeeting);
    let allMeetings = meetingRepository.getAllMeetings();
    expect(allMeetings.length).toStrictEqual(1);
    expect(allMeetings[0]).toStrictEqual(newMeeting);

    const newUpdatedMeeting = new Meeting(
      MeetingId.generate(),
      'topic-2',
      Role.Teacher,
    );
    const updatedMeeting = meetingRepository.updateMeeting(
      new MeetingId(addedMeeting.toPrimitives().id),
      newUpdatedMeeting,
    );

    expect(updatedMeeting).toStrictEqual(newUpdatedMeeting);
    const storedMeeting = meetingRepository.getMeetingById(
      new MeetingId(newUpdatedMeeting.toPrimitives().id),
    );
    expect(storedMeeting).toStrictEqual(newUpdatedMeeting);

    const deleted = meetingRepository.deleteMeeting(
      new MeetingId(updatedMeeting.toPrimitives().id),
    );
    expect(deleted).toBeTruthy();

    allMeetings = meetingRepository.getAllMeetings();
    expect(allMeetings.length).toStrictEqual(0);
  });
});
