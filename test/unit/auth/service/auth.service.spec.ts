import { Test, TestingModule } from '@nestjs/testing';
import { ModuleConnectors } from '../../../../src/context/shared/infrastructure/moduleConnectors';
import { AuthService } from '../../../../src/context/auth/service/auth.service';
import { PasswordService } from '../../../../src/context/shared/utils/password.service';
import UserInfoDto from '../../../../src/context/auth/domain/userInfoDto';
import { InvalidEmailException } from '../../../../src/context/auth/exceptions/invalidEmailException';
import { InvalidPasswordException } from '../../../../src/context/auth/exceptions/invalidPasswordException';
import UserId from '../../../../src/context/shared/domain/userId';
import {
  TOKEN_EXPIRES_IN_SECONDS,
  TOKEN_ISSUER,
  TOKEN_TYPE,
} from '../../../../src/context/auth/config';
import ms from 'ms';
import { JoseWrapper } from '../../../../src/context/shared/infrastructure/joseWrapper';
import { mock } from 'jest-mock-extended';
import { Role } from '../../../../src/context/shared/domain/role';

describe('AuthService', () => {
  let service: AuthService;
  let moduleConnectors: ModuleConnectors;
  let passwordService: PasswordService;
  let joseWrapper: JoseWrapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ModuleConnectors,
          useValue: {
            obtainUserInformation: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            comparePasswords: jest.fn(),
          },
        },
        {
          provide: 'JoseWrapperInitialized',
          useValue: mock<JoseWrapper>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    moduleConnectors = module.get<ModuleConnectors>(ModuleConnectors);
    passwordService = module.get<PasswordService>(PasswordService);
    joseWrapper = module.get<JoseWrapper>('JoseWrapperInitialized');
  });

  it('should validate user successfully', async () => {
    const email = 'user@example.com';
    const password = 'password';
    const user = {
      toPrimitives: () => ({
        id: UserId.generate().toPrimitive(),
        email,
        firstName: 'John',
        familyName: 'Doe',
        password: 'hashedPassword',
        role: 'Teacher',
      }),
    };

    (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
      user,
    );
    (passwordService.comparePasswords as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser(email, password);

    expect(moduleConnectors.obtainUserInformation).toHaveBeenCalledWith(
      undefined,
      email,
    );
    expect(passwordService.comparePasswords).toHaveBeenCalledWith(
      password,
      'hashedPassword',
    );
    expect(result).toBeInstanceOf(UserInfoDto);
  });
  it('should throw InvalidEmailException if user does not exist', async () => {
    const email = 'user@example.com';
    const password = 'password';

    (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
      null,
    );

    await expect(service.validateUser(email, password)).rejects.toThrow(
      InvalidEmailException,
    );
  });
  it('should throw InvalidPasswordException if password is incorrect', async () => {
    const email = 'user@example.com';
    const password = 'password';
    const user = {
      toPrimitives: () => ({
        id: UserId.generate().toPrimitive(),
        email,
        firstName: 'John',
        familyName: 'Doe',
        password: 'hashedPassword',
        role: 'Teacher',
      }),
    };

    (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
      user,
    );
    (passwordService.comparePasswords as jest.Mock).mockResolvedValue(false);

    await expect(service.validateUser(email, password)).rejects.toThrow(
      InvalidPasswordException,
    );
  });
  it('should generate login response successfully', async () => {
    const user = {
      id: UserId.generate().toPrimitive(),
      email: 'user@example.com',
      firstName: 'John',
      familyName: 'Doe',
      role: 'Teacher',
    };
    const expectedAccessToken = 'access_token';

    (joseWrapper.signJwt as jest.Mock).mockResolvedValueOnce(
      expectedAccessToken,
    );

    const result = await service.login(user);

    expect(joseWrapper.signJwt).toHaveBeenCalledWith(
      {
        email: user.email,
        role: Role.Teacher.toString(),
        sub: user.id,
      },
      TOKEN_ISSUER,
    );
    expect(result.access_token).toBe(expectedAccessToken);
    expect(result.token_type).toBe(TOKEN_TYPE);
    expect(result.expires_in).toBe(ms(TOKEN_EXPIRES_IN_SECONDS));
  });
});
