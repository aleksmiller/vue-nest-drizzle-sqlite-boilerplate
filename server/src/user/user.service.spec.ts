// Mock modules before imports
jest.mock('../lib/auth', () => ({
  hashPassword: jest.fn((pwd: string) => Promise.resolve('hashed-' + pwd)),
  verifyPassword: jest.fn(),
  generateUserId: jest.fn(),
}));

jest.mock('../db/drizzle', () => ({
  db: null,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { createTestDb, cleanupTestDb } from '../test-utils/test-db';
import { Database } from 'better-sqlite3';
// @ts-expect-error - Path resolution works at runtime via Jest moduleNameMapper
import { usersTable, userProfilesTable } from '../db/schema';
// @ts-expect-error - Path resolution works at runtime via Jest moduleNameMapper
import { hashPassword } from '../lib/auth';
// @ts-expect-error - Path resolution works at runtime via Jest moduleNameMapper
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { db } from '../db/drizzle';

describe('UserService', () => {
  let service: UserService;
  let testDb: ReturnType<typeof createTestDb>;
  let sqlite: Database;

  beforeEach(async () => {
    // Create in-memory test database
    testDb = createTestDb();
    sqlite = testDb.sqlite;
    (db as any) = testDb.db;

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    cleanupTestDb(sqlite);
  });

  describe('getProfile', () => {
    it('should return user profile with profile data', async () => {
      // Create user
      const userId = 'user-id-123';
      const hashedPassword = await hashPassword('password123');
      await testDb.db.insert(usersTable).values({
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword,
        createdAt: new Date(),
      });

      // Create profile
      await testDb.db.insert(userProfilesTable).values({
        userId,
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio',
      });

      const result = await service.getProfile(userId);

      expect(result).toHaveProperty('id', userId);
      expect(result).toHaveProperty('username', 'testuser');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result.profile).not.toBeNull();
      expect(result.profile?.firstName).toBe('John');
      expect(result.profile?.lastName).toBe('Doe');
      expect(result.profile?.bio).toBe('Test bio');
    });

    it('should return user profile with null profile if no profile exists', async () => {
      // Create user without profile
      const userId = 'user-id-123';
      const hashedPassword = await hashPassword('password123');
      await testDb.db.insert(usersTable).values({
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword,
        createdAt: new Date(),
      });

      const result = await service.getProfile(userId);

      expect(result).toHaveProperty('id', userId);
      expect(result).toHaveProperty('username', 'testuser');
      expect(result.profile).toBeNull();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('updateProfile', () => {
    it('should create profile if it does not exist', async () => {
      // Create user
      const userId = 'user-id-123';
      const hashedPassword = await hashPassword('password123');
      await testDb.db.insert(usersTable).values({
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword,
        createdAt: new Date(),
      });

      const updateDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'New bio',
      };

      const result = await service.updateProfile(userId, updateDto);

      expect(result.message).toBe('Profile updated successfully');
      expect(result.profile).not.toBeNull();
      expect(result.profile?.firstName).toBe('Jane');
      expect(result.profile?.lastName).toBe('Smith');
      expect(result.profile?.bio).toBe('New bio');
    });

    it('should update existing profile', async () => {
      // Create user
      const userId = 'user-id-123';
      const hashedPassword = await hashPassword('password123');
      await testDb.db.insert(usersTable).values({
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword,
        createdAt: new Date(),
      });

      // Create existing profile
      await testDb.db.insert(userProfilesTable).values({
        userId,
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Old bio',
      });

      const updateDto = {
        firstName: 'Jane',
        bio: 'Updated bio',
      };

      const result = await service.updateProfile(userId, updateDto);

      expect(result.message).toBe('Profile updated successfully');
      expect(result.profile?.firstName).toBe('Jane');
      expect(result.profile?.lastName).toBe('Doe'); // Should remain unchanged
      expect(result.profile?.bio).toBe('Updated bio');
    });

    it('should update only provided fields', async () => {
      // Create user
      const userId = 'user-id-123';
      const hashedPassword = await hashPassword('password123');
      await testDb.db.insert(usersTable).values({
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword,
        createdAt: new Date(),
      });

      // Create existing profile
      await testDb.db.insert(userProfilesTable).values({
        userId,
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Original bio',
      });

      const updateDto = {
        firstName: 'Jane',
        // lastName and bio not provided
      };

      const result = await service.updateProfile(userId, updateDto);

      expect(result.profile?.firstName).toBe('Jane');
      expect(result.profile?.lastName).toBe('Doe'); // Should remain unchanged
      expect(result.profile?.bio).toBe('Original bio'); // Should remain unchanged
    });

    it('should return existing profile if no changes provided', async () => {
      // Create user
      const userId = 'user-id-123';
      const hashedPassword = await hashPassword('password123');
      await testDb.db.insert(usersTable).values({
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword,
        createdAt: new Date(),
      });

      // Create existing profile
      await testDb.db.insert(userProfilesTable).values({
        userId,
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Original bio',
      });

      const updateDto = {};
      // No fields provided

      const result = await service.updateProfile(userId, updateDto);

      expect(result.message).toBe('No changes provided');
      expect(result.profile?.firstName).toBe('John');
    });

    it('should handle null values', async () => {
      // Create user
      const userId = 'user-id-123';
      const hashedPassword = await hashPassword('password123');
      await testDb.db.insert(usersTable).values({
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        hashedPassword,
        createdAt: new Date(),
      });

      // Create existing profile
      await testDb.db.insert(userProfilesTable).values({
        userId,
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Original bio',
      });

      const updateDto = {
        firstName: null,
        bio: null,
      };

      const result = await service.updateProfile(userId, updateDto);

      expect(result.profile?.firstName).toBeNull();
      expect(result.profile?.bio).toBeNull();
      expect(result.profile?.lastName).toBe('Doe'); // Should remain unchanged
    });
  });
});
