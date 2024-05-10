import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../../src/context/user/service/user.service';
import { UserRepository } from '../../../../src/context/user/infrastructure/userRepository';
import { PasswordService } from '../../../../src/context/shared/utils/password.service';
import { EmailAlreadyExistsException } from '../../../../src/context/user/exception/emailAlreadyExistsException';
import { NotAbleToExecuteUserDbTransactionException } from '../../../../src/context/user/exception/notAbleToExecuteUserDbTransactionException';
import { InvalidRoleException } from '../../../../src/context/shared/exceptions/invalidRoleException';
import { UserNotFoundException } from '../../../../src/context/user/exception/userNotFoundException';
import UserId from '../../../../src/context/shared/domain/userId';
import { WrongPermissionsException } from '../../../../src/context/user/exception/wrongPermissionsException';
import { UserQuery } from '../../../../src/context/user/service/user.query';
import User from '../../../../src/context/shared/domain/user';
import { Role } from '../../../../src/context/shared/domain/role';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let passwordService: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            addUser: jest.fn(),
            getUserByEmail: jest.fn(),
            getUserById: jest.fn(),
            getAllUsers: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  it('should create a new user', async () => {
    const request = {
      firstName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'Teacher',
    };

    const encryptedPassword = 'hashedPassword';
    const userResponse = {
      id: UserId.generate().toPrimitive(),
      firstName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      role: 'Teacher',
    };

    (passwordService.hashPassword as jest.Mock).mockResolvedValue(
      encryptedPassword,
    );
    (userRepository.addUser as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => userResponse,
    });

    const result = await service.create(request);

    expect(passwordService.hashPassword).toHaveBeenCalledWith(request.password);
    expect(userRepository.addUser).toHaveBeenCalledWith(
      new User(
        expect.any(UserId),
        'John',
        'Doe',
        'john.doe@example.com',
        'hashedPassword',
        Role.Teacher,
      ),
    );
    expect(result).toEqual(userResponse);
  });
  it('should throw InvalidRoleException for invalid role', async () => {
    const request = {
      firstName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'INVALID_ROLE',
    };

    await expect(service.create(request)).rejects.toThrow(InvalidRoleException);
  });
  it('should throw EmailAlreadyExistsException if email already exists', async () => {
    const request = {
      firstName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'Teacher',
    };

    (userRepository.getUserByEmail as jest.Mock).mockReturnValueOnce({
      firstName: 'John 2',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'Teacher',
    });

    await expect(service.create(request)).rejects.toThrow(
      EmailAlreadyExistsException,
    );
  });
  it('should throw NotAbleToExecuteUserDbTransactionException if addUser fails', async () => {
    const request = {
      firstName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'Teacher',
    };

    (userRepository.addUser as jest.Mock).mockReturnValueOnce(null);

    await expect(service.create(request)).rejects.toThrow(
      NotAbleToExecuteUserDbTransactionException,
    );
  });
  it('should return user by ID', () => {
    const userId = UserId.generate().toPrimitive();
    const userResponse = {
      id: userId,
      firstName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      role: 'Teacher',
    };

    (userRepository.getUserById as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => userResponse,
    });

    const result = service.getById(userId);

    expect(userRepository.getUserById).toHaveBeenCalledWith(new UserId(userId));
    expect(result).toEqual(userResponse);
  });
  it('should throw UserNotFoundException if user does not exist', () => {
    const userId = UserId.generate().toPrimitive();

    (userRepository.getUserById as jest.Mock).mockReturnValueOnce(null);

    expect(() => service.getById(userId)).toThrow(UserNotFoundException);
  });
  it('should return all users', () => {
    const users = [
      {
        id: UserId.generate().toPrimitive(),
        firstName: 'John',
        familyName: 'Doe',
        email: 'john.doe@example.com',
        role: 'Teacher',
      },
      {
        id: UserId.generate().toPrimitive(),
        firstName: 'Jane',
        familyName: 'Doe',
        email: 'jane.doe@example.com',
        role: 'Student',
      },
    ];

    (userRepository.getAllUsers as jest.Mock).mockReturnValueOnce(
      users.map((user) => ({ toPrimitives: () => user })),
    );

    const result = service.getAll();

    expect(userRepository.getAllUsers).toHaveBeenCalled();
    expect(result).toEqual(users);
  });
  it('should return an empty array if no users are found', () => {
    (userRepository.getAllUsers as jest.Mock).mockReturnValueOnce([]);

    const result = service.getAll();

    expect(userRepository.getAllUsers).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
  it('should update user successfully', () => {
    const userId = UserId.generate().toPrimitive();
    const request = {
      firstName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      role: 'Student',
    };
    const userAuthInfo = {
      id: userId,
      email: request.email,
      role: Role.Student.toString(),
    };

    const oldUser = {
      toPrimitives: () => ({
        id: userId,
        firstName: 'Old John',
        familyName: 'Old Doe',
        email: 'old.john.doe@example.com',
        role: 'Teacher',
      }),
    };

    (userRepository.getUserById as jest.Mock).mockReturnValueOnce(oldUser);
    (userRepository.updateUser as jest.Mock).mockReturnValueOnce({
      toPrimitives: () => ({ ...oldUser.toPrimitives(), ...request }),
    });

    const result = service.update(userId, request, userAuthInfo);

    expect(userRepository.getUserById).toHaveBeenCalledWith(new UserId(userId));
    expect(userRepository.updateUser).toHaveBeenCalledWith(
      new UserId(userId),
      new User(
        expect.any(UserId),
        'John',
        'Doe',
        'john.doe@example.com',
        undefined,
        Role.Student,
      ),
    );
    expect(result).toEqual(expect.objectContaining(request));
  });
  it('should throw UserNotFoundException if user does not exist', () => {
    const userId = UserId.generate().toPrimitive();
    const request = {
      firstName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      role: 'Student',
    };
    const userAuthInfo = {
      id: userId,
      email: request.email,
      role: Role.Student.toString(),
    };

    (userRepository.getUserById as jest.Mock).mockReturnValueOnce(null);

    expect(() => service.update(userId, request, userAuthInfo)).toThrow(
      UserNotFoundException,
    );
  });
  it('should throw WrongPermissionsException if user does not have permission to update', () => {
    const userId = UserId.generate().toPrimitive();
    const request = {
      firstName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      role: 'Student',
    };
    const userAuthInfo = {
      id: UserId.generate().toPrimitive(),
      email: request.email,
      role: Role.Student.toString(),
    }; // User does not have permission

    const oldUser = {
      toPrimitives: () => ({
        id: userId,
        firstName: 'Old John',
        familyName: 'Old Doe',
        email: 'old.john.doe@example.com',
        role: 'Teacher',
      }),
    };

    (userRepository.getUserById as jest.Mock).mockReturnValueOnce(oldUser);

    expect(() => service.update(userId, request, userAuthInfo)).toThrow(
      WrongPermissionsException,
    );
  });
  it('should throw NotAbleToExecuteUserDbTransactionException if updateUser fails', () => {
    const userId = UserId.generate().toPrimitive();
    const request = {
      firstName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      role: 'Student',
    };
    const userAuthInfo = {
      id: userId,
      email: request.email,
      role: Role.Student.toString(),
    };

    const oldUser = {
      toPrimitives: () => ({
        id: userId,
        firstName: 'Old John',
        familyName: 'Old Doe',
        email: 'old.john.doe@example.com',
        role: 'Teacher',
      }),
    };

    (userRepository.getUserById as jest.Mock).mockReturnValueOnce(oldUser);
    (userRepository.updateUser as jest.Mock).mockReturnValueOnce(null);

    expect(() => service.update(userId, request, userAuthInfo)).toThrow(
      NotAbleToExecuteUserDbTransactionException,
    );
  });
  it('should delete user successfully', () => {
    const userId = UserId.generate().toPrimitive();
    const userAuthInfo = {
      id: userId,
      email: 'old.john.doe@example.com',
      role: Role.Teacher.toString(),
    };

    const oldUser = {
      toPrimitives: () => ({
        id: userId,
        firstName: 'Old John',
        familyName: 'Old Doe',
        email: 'old.john.doe@example.com',
        role: 'Teacher',
      }),
    };

    (userRepository.getUserById as jest.Mock).mockReturnValueOnce(oldUser);
    (userRepository.deleteUser as jest.Mock).mockReturnValueOnce(true);

    expect(() => service.deleteById(userId, userAuthInfo)).not.toThrow();
    expect(userRepository.getUserById).toHaveBeenCalledWith(new UserId(userId));
    expect(userRepository.deleteUser).toHaveBeenCalledWith(new UserId(userId));
  });
  it('should throw UserNotFoundException if user does not exist', () => {
    const userId = UserId.generate().toPrimitive();
    const userAuthInfo = {
      id: userId,
      email: 'john.doe@example.com',
      role: Role.Teacher.toString(),
    };

    (userRepository.getUserById as jest.Mock).mockReturnValueOnce(null);

    expect(() => service.deleteById(userId, userAuthInfo)).toThrow(
      UserNotFoundException,
    );
  });
  it('should throw WrongPermissionsException if user does not have permission to delete', () => {
    const userId = UserId.generate().toPrimitive();
    const userAuthInfo = {
      id: UserId.generate().toPrimitive(),
      email: 'wrong-email@example.com',
      role: Role.Teacher.toString(),
    }; // User does not have permission

    const oldUser = {
      toPrimitives: () => ({
        id: userId,
        firstName: 'Old John',
        familyName: 'Old Doe',
        email: 'old.john.doe@example.com',
        role: 'Teacher',
      }),
    };

    (userRepository.getUserById as jest.Mock).mockReturnValueOnce(oldUser);

    expect(() => service.deleteById(userId, userAuthInfo)).toThrow(
      WrongPermissionsException,
    );
  });
  it('should throw NotAbleToExecuteUserDbTransactionException if deleteUser fails', () => {
    const userId = UserId.generate().toPrimitive();
    const userAuthInfo = {
      id: userId,
      email: 'old.john.doe@example.com',
      role: Role.Student.toString(),
    };

    const oldUser = {
      toPrimitives: () => ({
        id: userId,
        firstName: 'Old John',
        familyName: 'Old Doe',
        email: 'old.john.doe@example.com',
        role: 'Student',
      }),
    };

    (userRepository.getUserById as jest.Mock).mockReturnValueOnce(oldUser);
    (userRepository.deleteUser as jest.Mock).mockReturnValueOnce(false);

    expect(() => service.deleteById(userId, userAuthInfo)).toThrow(
      NotAbleToExecuteUserDbTransactionException,
    );
  });
  it('should execute query successfully with id as search parameter', async () => {
    const email = 'test@example.com';
    const query: UserQuery = new UserQuery(undefined, email);
    const user = {
      id: UserId.generate().toPrimitive(),
      firstName: 'John',
      familyName: 'Doe',
      email,
      role: 'Teacher',
    };

    (userRepository.getUserByEmail as jest.Mock).mockReturnValueOnce(user);

    const result = await service.execute(query);

    expect(userRepository.getUserByEmail).toHaveBeenCalledWith(email);
    expect(result).toEqual(user);
  });
  it('should execute query successfully with email as search parameter', async () => {
    const userId = UserId.generate();
    const query: UserQuery = new UserQuery(userId.toPrimitive());
    const user = {
      id: userId.toPrimitive(),
      firstName: 'John',
      familyName: 'Doe',
      email: 'test@example.com',
      role: 'Teacher',
    };

    (userRepository.getUserById as jest.Mock).mockReturnValueOnce(user);

    const result = await service.execute(query);

    expect(userRepository.getUserById).toHaveBeenCalledWith(userId);
    expect(result).toEqual(user);
  });
});
