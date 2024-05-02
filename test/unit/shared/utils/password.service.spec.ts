import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PasswordService } from '../../../../src/context/shared/utils/password.service';

jest.mock('bcrypt');

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should hash password successfully', async () => {
    const password = 'password';
    const hashedPassword = 'hashedPassword';

    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

    const result = await service.hashPassword(password);

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(password, 'salt');
    expect(result).toBe(hashedPassword);
  });

  it('should compare passwords successfully', async () => {
    const plainPassword = 'password';
    const hashedPassword = 'hashedPassword';
    const expectedResult = true;

    (bcrypt.compare as jest.Mock).mockResolvedValue(expectedResult);

    const result = await service.comparePasswords(
      plainPassword,
      hashedPassword,
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    expect(result).toBe(expectedResult);
  });
});
