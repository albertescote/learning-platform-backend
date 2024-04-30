import { UserService } from '../../../../src/context/user/service/user.service';
import { UserRepository } from '../../../../src/context/user/infrastructure/userRepository';
import { mock } from 'jest-mock-extended';
import User from '../../../../src/context/user/domain/user';
import UserId from '../../../../src/context/user/domain/userId';

describe('User Service should', () => {
  const userRepositoryMock = mock<UserRepository>();
  const userService = new UserService(userRepositoryMock);

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('create a new user', async () => {
    const expectedRepositoryReturnValue: User = new User(
      UserId.generate(),
      'John',
      'Doe',
      'email@example.com',
      '1234',
    );
    userRepositoryMock.addUser.mockReturnValue(expectedRepositoryReturnValue);

    const newUser = await userService.create({
      firstName: 'John',
      familyName: 'Doe',
      email: 'email@example.com',
      password: '1234',
    });

    expect(newUser.id).toStrictEqual(
      expectedRepositoryReturnValue.toPrimitives().id,
    );
    expect(userRepositoryMock.addUser).toHaveBeenCalled();
  });
  it('get a user by id', () => {
    const expectedRepositoryReturnValue: User = new User(
      UserId.generate(),
      'John',
      'Doe',
      'email@example.com',
      '1234',
    );
    userRepositoryMock.getUserById.mockReturnValue(
      expectedRepositoryReturnValue,
    );

    const user = userService.getById(
      expectedRepositoryReturnValue.toPrimitives().id,
    );

    expect(user.id).toStrictEqual(
      expectedRepositoryReturnValue.toPrimitives().id,
    );
    expect(userRepositoryMock.getUserById).toHaveBeenCalledWith(
      new UserId(expectedRepositoryReturnValue.toPrimitives().id),
    );
  });
  it('get all users', () => {
    const newUser: User = new User(
      UserId.generate(),
      'John',
      'Doe',
      'email@example.com',
      '1234',
    );
    const expectedRepositoryReturnValue = [newUser];
    userRepositoryMock.getAllUsers.mockReturnValue(
      expectedRepositoryReturnValue,
    );

    const allUsers = userService.getAll();

    expect(allUsers.length).toStrictEqual(1);
    expect(allUsers[0].id).toStrictEqual(newUser.toPrimitives().id);
    expect(userRepositoryMock.getAllUsers).toHaveBeenCalled();
  });
  it('update a user', () => {
    const expectedRepositoryReturnValue: User = new User(
      UserId.generate(),
      'John',
      'Doe',
      'email@example.com',
      '1234',
    );
    userRepositoryMock.updateUser.mockReturnValue(
      expectedRepositoryReturnValue,
    );

    const user = userService.update(
      expectedRepositoryReturnValue.toPrimitives().id,
      expectedRepositoryReturnValue.toPrimitives(),
    );

    expect(user.id).toStrictEqual(
      expectedRepositoryReturnValue.toPrimitives().id,
    );
    expect(userRepositoryMock.updateUser).toHaveBeenCalledWith(
      new UserId(expectedRepositoryReturnValue.toPrimitives().id),
      expectedRepositoryReturnValue,
    );
  });
  it('delete a user', () => {
    userRepositoryMock.deleteUser.mockReturnValue(true);

    const userId = UserId.generate();
    userService.deleteById(userId.toPrimitive());

    expect(userRepositoryMock.deleteUser).toHaveBeenCalledWith(userId);
  });
});
