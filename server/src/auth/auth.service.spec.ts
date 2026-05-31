// Mock modules before imports
const mockCreateSession = jest.fn();
const mockInvalidateSession = jest.fn();

jest.mock('../lib/lucia', () => ({
  lucia: {
    createSession: (...args: any[]) => mockCreateSession(...args),
    invalidateSession: (...args: any[]) => mockInvalidateSession(...args),
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

jest.mock('../db/drizzle', () => ({
  db: null,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createTestDb, cleanupTestDb } from '../test-utils/test-db';
import { Database } from 'better-sqlite3';
// @ts-expect-error - Path resolution works at runtime via Jest moduleNameMapper
import { usersTable } from '../db/schema';
// @ts-expect-error - Path resolution works at runtime via Jest moduleNameMapper
import { hashPassword } from '../lib/auth';
// @ts-expect-error - Path resolution works at runtime via Jest moduleNameMapper
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { db } from '../db/drizzle';

describe('AuthService', () => {
  let service: AuthService;
  let testDb: ReturnType<typeof createTestDb>;
  let sqlite: Database;

  beforeEach(async () => {
    // Create in-memory test database
    testDb = createTestDb();
    sqlite = testDb.sqlite;
    (db as any) = testDb.db;

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupTestDb(sqlite);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockSession = { id: 'session-id-123' };
      mockCreateSession.mockResolvedValue(mockSession);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('sessionId', 'session-id-123');
      expect(result.message).toBe('User registered successfully');
      expect(mockCreateSession).toHaveBeenCalledWith(result.userId, {});

      // Verify user was created in database
      const users = await testDb.db.select().from(usersTable);
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('testuser');
      expect(users[0].email).toBe('test@example.com');
    });

    it('should throw ConflictException if username already exists', async () => {
      // Create existing user
      const hashedPassword = await hashPassword('password123');
      await testDb.db.insert(usersTable).values({
        id: 'existing-user-id',
        username: 'existinguser',
        email: 'existing@example.com',
        hashedPassword,
      });

      const registerDto = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
      };

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Username or email already taken',
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      // Create existing user
      const hashedPassword = await hashPassword('password123');
      await testDb.db.insert(usersTable).values({
        id: 'existing-user-id',
        username: 'existinguser',
        email: 'existing@example.com',
        hashedPassword,
      });

      const registerDto = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
      };

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Username or email already taken',
      );
    });

    it('should hash password before storing', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockSession = { id: 'session-id-123' };
      mockCreateSession.mockResolvedValue(mockSession);

      await service.register(registerDto);

      const users = await testDb.db.select().from(usersTable);
      expect(users[0].hashedPassword).not.toBe('password123');
      expect(users[0].hashedPassword).toBe('hashed-password123'); // Mocked hash
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      // Create user
      const hashedPassword = await hashPassword('password123');
      const userId = 'user-id-123';
      await testDb.db.insert(usersTable).values({
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword,
      });

      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockSession = { id: 'session-id-123' };
      mockCreateSession.mockResolvedValue(mockSession);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('sessionId', 'session-id-123');
      expect(result.message).toBe('Logged in successfully');
      expect(mockCreateSession).toHaveBeenCalledWith(userId, {});
    });

    it('should throw UnauthorizedException if email does not exist', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Create user
      const hashedPassword = await hashPassword('correctpassword');
      await testDb.db.insert(usersTable).values({
        id: 'user-id-123',
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword,
      });

      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });

  describe('signOut', () => {
    it('should invalidate session successfully', async () => {
      const sessionId = 'session-id-123';
      mockInvalidateSession.mockResolvedValue(undefined);

      const result = await service.signOut(sessionId);

      expect(result.message).toBe('Signed out successfully');
      expect(mockInvalidateSession).toHaveBeenCalledWith(sessionId);
    });
  });
});
