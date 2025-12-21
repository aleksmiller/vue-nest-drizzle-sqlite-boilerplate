import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { db } from '../../db/drizzle';
import { usersTable } from '../../db/schema';
import { hashPassword, generateUserId, verifyPassword } from '../../lib/auth';
import { lucia } from '../../lib/lucia';
import { eq, or } from 'drizzle-orm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // Check if username or email already exists
    const existingUser = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(or(eq(usersTable.username, username), eq(usersTable.email, email)))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('Username or email already taken');
    }

    const hashedPassword = await hashPassword(password);
    const userId = generateUserId();

    await db.insert(usersTable).values({
      id: userId,
      username,
      email,
      hashedPassword,
    });

    const session = await lucia.createSession(userId, {});

    return {
      message: 'User registered successfully',
      userId,
      sessionId: session.id,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUsers.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = existingUsers[0];

    const isValidPassword = await verifyPassword(user.hashedPassword, password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const session = await lucia.createSession(user.id, {});

    return {
      message: 'Logged in successfully',
      userId: user.id,
      sessionId: session.id,
    };
  }

  async signOut(sessionId: string) {
    await lucia.invalidateSession(sessionId);
    return {
      message: 'Signed out successfully',
    };
  }
}

