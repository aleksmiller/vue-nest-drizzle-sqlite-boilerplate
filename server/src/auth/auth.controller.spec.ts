// Mock lucia BEFORE any imports
const mockCreateSessionCookie = jest.fn();
const mockCreateBlankSessionCookie = jest.fn();

jest.mock('../lib/lucia', () => ({
  lucia: {
    createSessionCookie: (...args: any[]) => mockCreateSessionCookie(...args),
    createBlankSessionCookie: (...args: any[]) =>
      mockCreateBlankSessionCookie(...args),
    sessionCookieName: 'session',
  },
}));

jest.mock('../lib/auth', () => ({
  hashPassword: jest.fn((pwd: string) => Promise.resolve('hashed-' + pwd)),
  verifyPassword: jest.fn((hash: string, pwd: string) =>
    Promise.resolve(hash === 'hashed-' + pwd),
  ),
  generateUserId: jest.fn(
    () => 'user-id-' + Math.random().toString(36).substr(2, 9),
  ),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      signOut: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    mockResponse = {
      cookie: jest.fn(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      cookies: {},
      signedCookies: {},
    };

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const serviceResult = {
        message: 'User registered successfully',
        userId: 'user-id-123',
        sessionId: 'session-id-123',
      };

      (authService.register as jest.Mock).mockResolvedValue(serviceResult);
      mockCreateSessionCookie.mockReturnValue({
        name: 'session',
        value: 'session-cookie-value',
        attributes: {},
      });

      await controller.register(registerData, mockResponse as Response);

      expect(authService.register).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'session',
        'session-cookie-value',
        {},
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: serviceResult.message,
        userId: serviceResult.userId,
      });
    });

    it('should throw BadRequestException for invalid input', async () => {
      const invalidData = {
        username: '', // Invalid: empty
        email: 'not-an-email',
        password: '123', // Invalid: too short
      };

      await expect(
        controller.register(invalidData, mockResponse as Response),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle service errors', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new Error('Service error'),
      );

      await expect(
        controller.register(registerData, mockResponse as Response),
      ).rejects.toThrow('Service error');
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const serviceResult = {
        message: 'Logged in successfully',
        userId: 'user-id-123',
        sessionId: 'session-id-123',
      };

      (authService.login as jest.Mock).mockResolvedValue(serviceResult);
      mockCreateSessionCookie.mockReturnValue({
        name: 'session',
        value: 'session-cookie-value',
        attributes: {},
      });

      await controller.login(loginData, mockResponse as Response);

      expect(authService.login).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'session',
        'session-cookie-value',
        {},
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: serviceResult.message,
        userId: serviceResult.userId,
      });
    });

    it('should throw BadRequestException for invalid input', async () => {
      const invalidData = {
        email: 'not-an-email',
        password: '',
      };

      await expect(
        controller.login(invalidData, mockResponse as Response),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully with valid session', async () => {
      mockRequest.cookies = { session: 'session-id-123' };
      (authService.signOut as jest.Mock).mockResolvedValue({
        message: 'Signed out successfully',
      });
      mockCreateBlankSessionCookie.mockReturnValue({
        name: 'session',
        value: '',
        attributes: {},
      });

      await controller.signOut(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.signOut).toHaveBeenCalledWith('session-id-123');
      expect(mockResponse.cookie).toHaveBeenCalledWith('session', '', {});
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Signed out successfully',
      });
    });

    it('should use signedCookies if cookies are not available', async () => {
      mockRequest.cookies = {};
      mockRequest.signedCookies = { session: 'signed-session-id-123' };
      (authService.signOut as jest.Mock).mockResolvedValue({
        message: 'Signed out successfully',
      });
      mockCreateBlankSessionCookie.mockReturnValue({
        name: 'session',
        value: '',
        attributes: {},
      });

      await controller.signOut(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.signOut).toHaveBeenCalledWith('signed-session-id-123');
    });

    it('should throw UnauthorizedException if no session cookie', async () => {
      mockRequest.cookies = {};
      mockRequest.signedCookies = {};

      await expect(
        controller.signOut(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedException);
      expect(authService.signOut).not.toHaveBeenCalled();
    });
  });
});
