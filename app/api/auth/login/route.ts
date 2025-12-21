import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { usersTable } from "@/db/schema";
import { verifyPassword } from "@/lib/auth";
import { lucia } from "@/lib/lucia";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = loginSchema.parse(body);
    const { email, password } = parsedBody;

    const existingUsers = await db
      .select() // Select all columns to get user attributes for Lucia
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUsers.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      ); // 401 Unauthorized
    }
    const user = existingUsers[0];

    const isValidPassword = await verifyPassword(user.hashedPassword, password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const session = await lucia.createSession(user.id, {}); // Pass user attributes if needed by session
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return NextResponse.json(
      { message: "Logged in successfully", userId: user.id },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
