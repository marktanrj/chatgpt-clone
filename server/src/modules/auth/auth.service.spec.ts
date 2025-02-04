import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRepository } from '../user/user.repository';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    id: '1',
    username: 'testuser',
    hashedPassword: 'hashedPassword123',
  } as any;

  beforeEach(async () => {
    const mockUserRepository = {
      findByUsername: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
  });

  describe('sign up', () => {
    const signUpDto = {
      username: 'testuser',
      password: 'password123',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully sign up a new user', async () => {
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword123');

      const result = await service.signUp(signUpDto);

      expect(userRepository.findByUsername).toHaveBeenCalledWith(signUpDto.username);
      expect(bcrypt.hashSync).toHaveBeenCalledWith(signUpDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        username: signUpDto.username,
        hashedPassword: 'hashedPassword123',
      });
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      userRepository.findByUsername.mockResolvedValue(mockUser);

      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException);
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      userRepository.findByUsername.mockRejectedValue(error);

      await expect(service.signUp(signUpDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    const loginDto = {
      username: 'testuser',
      password: 'password123',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully login a user with valid credentials', async () => {
      userRepository.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(userRepository.findByUsername).toHaveBeenCalledWith(loginDto.username);
      expect(bcrypt.compareSync).toHaveBeenCalledWith(loginDto.password, mockUser.hashedPassword);
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findByUsername.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compareSync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      userRepository.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      userRepository.findByUsername.mockRejectedValue(error);

      await expect(service.login(loginDto)).rejects.toThrow(error);
    });
  });
});
