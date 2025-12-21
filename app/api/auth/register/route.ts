import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { usersTable } from "@/db/schema";
import { hashPassword, generateUserId } from "@/lib/auth";
import { lucia } from "@/lib/lucia";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validators";
import { eq, or } from "drizzle-orm"; // Import 'or' for checking multiple conditions
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = registerSchema.parse(body); // Validates and throws ZodError if invalid

    const { username, email, password } = parsedBody;

    // Check if username or email already exists
    const existingUser = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(or(eq(usersTable.username, username), eq(usersTable.email, email)))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Username or email already taken" },
        { status: 409 }
      ); // 409 Conflict
    }

    const hashedPassword = await hashPassword(password);
    const userId = generateUserId();

    await db.insert(usersTable).values({
      id: userId,
      username,
      email,
      hashedPassword,
      // createdAt is handled by default SQL value
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return NextResponse.json(
      { message: "User registered successfully", userId },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
