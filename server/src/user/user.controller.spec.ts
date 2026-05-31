// Mock lib modules before imports
jest.mock('../lib/lucia', () => ({
  lucia: {
    sessionCookieName: 'session',
  },
}));

jest.mock('../lib/auth', () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
  generateUserId: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    };

    const mockAuthGuard = {
      canActivate: jest.fn(() => true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = 'user-id-123';
      const mockProfile = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        profile: {
          userId,
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Test bio',
        },
      };

      (userService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

      const result = await controller.getProfile({ id: userId });

      expect(userService.getProfile).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const userId = 'user-id-123';
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'Updated bio',
      };

      const mockUpdatedProfile = {
        message: 'Profile updated successfully',
        profile: {
          userId,
          firstName: 'Jane',
          lastName: 'Smith',
          bio: 'Updated bio',
        },
      };

      (userService.updateProfile as jest.Mock).mockResolvedValue(
        mockUpdatedProfile,
      );

      const result = await controller.updateProfile(updateData, { id: userId });

      expect(userService.updateProfile).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
          bio: 'Updated bio',
        }),
      );
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should handle partial updates', async () => {
      const userId = 'user-id-123';
      const updateData = {
        firstName: 'Jane',
        // lastName and bio not provided
      };

      const mockUpdatedProfile = {
        message: 'Profile updated successfully',
        profile: {
          userId,
          firstName: 'Jane',
          lastName: null,
          bio: null,
        },
      };

      (userService.updateProfile as jest.Mock).mockResolvedValue(
        mockUpdatedProfile,
      );

      const result = await controller.updateProfile(updateData, { id: userId });

      expect(userService.updateProfile).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          firstName: 'Jane',
        }),
      );
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should handle null values', async () => {
      const userId = 'user-id-123';
      const updateData = {
        firstName: null,
        lastName: null,
        bio: null,
      };

      const mockUpdatedProfile = {
        message: 'Profile updated successfully',
        profile: {
          userId,
          firstName: null,
          lastName: null,
          bio: null,
        },
      };

      (userService.updateProfile as jest.Mock).mockResolvedValue(
        mockUpdatedProfile,
      );

      const result = await controller.updateProfile(updateData, { id: userId });

      expect(result).toEqual(mockUpdatedProfile);
    });
  });
});
