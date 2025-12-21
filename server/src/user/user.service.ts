import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db/drizzle';
import { userProfilesTable, usersTable, UserSchema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { ProfileUpdateDto } from './dto/profile-update.dto';

@Injectable()
export class UserService {
  async getProfile(userId: string) {
    const userDetails = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (userDetails.length === 0) {
      throw new NotFoundException('User not found');
    }

    const profileData = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.userId, userId))
      .limit(1);

    return {
      ...userDetails[0],
      profile: profileData.length > 0 ? profileData[0] : null,
    };
  }

  async updateProfile(userId: string, profileUpdateDto: ProfileUpdateDto) {
    const dataToUpdate: Partial<typeof userProfilesTable.$inferInsert> = {};
    
    if (profileUpdateDto.firstName !== undefined) {
      dataToUpdate.firstName = profileUpdateDto.firstName;
    }
    if (profileUpdateDto.lastName !== undefined) {
      dataToUpdate.lastName = profileUpdateDto.lastName;
    }
    if (profileUpdateDto.bio !== undefined) {
      dataToUpdate.bio = profileUpdateDto.bio;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      // Return existing profile if no changes
      const existingProfile = await db
        .select()
        .from(userProfilesTable)
        .where(eq(userProfilesTable.userId, userId))
        .limit(1);

      return {
        message: 'No changes provided',
        profile: existingProfile.length > 0 ? existingProfile[0] : null,
      };
    }

    // Upsert logic: Insert if not exists, update if exists
    await db
      .insert(userProfilesTable)
      .values({
        userId: userId,
        firstName: dataToUpdate.firstName ?? null,
        lastName: dataToUpdate.lastName ?? null,
        bio: dataToUpdate.bio ?? null,
      })
      .onConflictDoUpdate({
        target: userProfilesTable.userId,
        set: {
          ...dataToUpdate,
          updatedAt: new Date(),
        },
      });

    const updatedProfile = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.userId, userId))
      .limit(1);

    return {
      message: 'Profile updated successfully',
      profile: updatedProfile[0],
    };
  }
}

