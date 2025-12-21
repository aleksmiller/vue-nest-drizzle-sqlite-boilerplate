import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '../db/drizzle';
import { sessionsTable, usersTable, type UserSchema } from '../db/schema';

const adapter = new DrizzleSQLiteAdapter(db, sessionsTable, usersTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: 'session', // Important to customize if you have other apps on the same domain
    expires: false, // session cookies have very long lifespan (30 days)
    attributes: {
      secure: process.env.NODE_ENV === 'production', // true if HTTPS
      sameSite: 'lax',
      path: '/',
    },
  },
  getUserAttributes: (attributes) => {
    // attributes is the data from your users table
    return {
      id: attributes.id,
      username: attributes.username,
      email: attributes.email,
      createdAt: attributes.createdAt,
    };
  },
});

// IMPORTANT! (Lucia docs)
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

type DatabaseUserAttributes = Omit<UserSchema, 'hashedPassword'>; // Exclude sensitive fields

// Validate request for Server Components and Route Handlers
/**
 * validateRequest for NestJS context
 * @param req Express Request object
 * @param res Express Response object (optional, only required if refreshing/clearing cookie)
 */
export const validateRequest = async (
  req: import('express').Request,
  res?: import('express').Response,
): Promise<{
  user: UserSchema | null;
  session: import('lucia').Session | null;
}> => {
  const sessionId =
    req.cookies?.[lucia.sessionCookieName] ||
    req.signedCookies?.[lucia.sessionCookieName] ||
    null;
  if (!sessionId) {
    return { user: null, session: null };
  }

  const result = await lucia.validateSession(sessionId);
  // If res is not passed, skip cookie updating
  if (res) {
    try {
      if (result.session && result.session.fresh) {
        // Refresh session cookie
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        res.cookie(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!result.session) {
        // Expired or invalid session - clear cookie
        const sessionCookie = lucia.createBlankSessionCookie();
        res.cookie(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch {
      // Ignore cookie write errors
    }
  }
  return result as {
    user: UserSchema | null;
    session: import('lucia').Session | null;
  };
};
