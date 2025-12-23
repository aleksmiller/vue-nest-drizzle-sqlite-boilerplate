import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

// Mock validateRequest
const mockValidateRequest = jest.fn();

jest.mock('../lib/lucia', () => ({
  validateRequest: (...args: any[]) => mockValidateRequest(...args),
}));

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockContext: ExecutionContext;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);

    mockRequest = {
      user: null,
      session: null,
    };

    mockResponse = {};

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as any;

    jest.clearAllMocks();
  });

  it('should allow access when user and session are valid', async () => {
    const mockUser = { id: 'user-id-123', username: 'testuser' };
    const mockSession = { id: 'session-id-123' };

    mockValidateRequest.mockResolvedValue({
      user: mockUser,
      session: mockSession,
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(mockUser);
    expect(mockRequest.session).toEqual(mockSession);
  });

  it('should throw UnauthorizedException when user is null', async () => {
    mockValidateRequest.mockResolvedValue({
      user: null,
      session: null,
    });

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      'Unauthorized',
    );
  });

  it('should throw UnauthorizedException when session is null', async () => {
    const mockUser = { id: 'user-id-123', username: 'testuser' };

    mockValidateRequest.mockResolvedValue({
      user: mockUser,
      session: null,
    });

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach user and session to request when valid', async () => {
    const mockUser = {
      id: 'user-id-123',
      username: 'testuser',
      email: 'test@example.com',
    };
    const mockSession = { id: 'session-id-123', userId: 'user-id-123' };

    mockValidateRequest.mockResolvedValue({
      user: mockUser,
      session: mockSession,
    });

    await guard.canActivate(mockContext);

    expect(mockRequest.user).toBe(mockUser);
    expect(mockRequest.session).toBe(mockSession);
  });
});
