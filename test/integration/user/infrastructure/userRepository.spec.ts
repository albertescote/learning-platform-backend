import { UserRepository } from '../../../../src/context/user/infrastructure/userRepository';
import User from '../../../../src/context/user/domain/user';
import UserId from '../../../../src/context/user/domain/userId';

describe('User Repository should', () => {
  const userRepository = new UserRepository();

  it('CRUD for user object', () => {
    const newUser: User = new User(
      UserId.generate(),
      'John',
      'Doe',
      'email@example.com',
      '1234',
    );

    const addedUser = userRepository.addUser(newUser);

    expect(addedUser).toStrictEqual(newUser);
    let allUsers = userRepository.getAllUsers();
    expect(allUsers.length).toStrictEqual(1);
    expect(allUsers[0]).toStrictEqual(newUser);

    const newUpdatedUser = new User(
      UserId.generate(),
      'John',
      'Doe',
      'email@example.com',
      '1234',
    );
    const updatedUser = userRepository.updateUser(
      new UserId(addedUser.toPrimitives().id),
      newUpdatedUser,
    );

    expect(updatedUser).toStrictEqual(newUpdatedUser);
    const storedUser = userRepository.getUserById(
      new UserId(newUpdatedUser.toPrimitives().id),
    );
    expect(storedUser).toStrictEqual(newUpdatedUser);

    const deleted = userRepository.deleteUser(
      new UserId(updatedUser.toPrimitives().id),
    );
    expect(deleted).toBeTruthy();

    allUsers = userRepository.getAllUsers();
    expect(allUsers.length).toStrictEqual(0);
  });
});
