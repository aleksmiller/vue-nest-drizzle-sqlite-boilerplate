import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/lucia";
import { db } from "@/db/drizzle";
import { userProfilesTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { profileUpdateSchema } from "@/lib/validators";
import { ZodError } from "zod";

// GET user profile
export async function GET() {
  const { user, session } = await validateRequest();

  if (!user || !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userDetails = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .limit(1);

    if (userDetails.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profileData = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.userId, user.id))
      .limit(1);

    return NextResponse.json(
      {
        ...userDetails[0],
        profile: profileData.length > 0 ? profileData[0] : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT (Update) user profile
export async function PUT(req: NextRequest) {
  const { user, session } = await validateRequest();

  if (!user || !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsedBody = profileUpdateSchema.parse(body);

    const dataToUpdate: Partial<typeof userProfilesTable.$inferInsert> = {};
    if (parsedBody.firstName !== undefined)
      dataToUpdate.firstName = parsedBody.firstName;
    if (parsedBody.lastName !== undefined)
      dataToUpdate.lastName = parsedBody.lastName;
    if (parsedBody.bio !== undefined) dataToUpdate.bio = parsedBody.bio;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { message: "No changes provided" },
        { status: 200 }
      );
    }

    // Upsert logic: Insert if not exists, update if exists
    await db
      .insert(userProfilesTable)
      .values({
        userId: user.id,
        firstName: dataToUpdate.firstName, // Will be null if not provided in dataToUpdate initially
        lastName: dataToUpdate.lastName,
        bio: dataToUpdate.bio,
        // updatedAt is handled by schema default/onUpdate
      })
      .onConflictDoUpdate({
        target: userProfilesTable.userId,
        set: {
          ...dataToUpdate,
          updatedAt: new Date(), // Explicitly set updatedAt on update
        },
      });

    const updatedProfile = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.userId, user.id))
      .limit(1);

    return NextResponse.json(
      { message: "Profile updated successfully", profile: updatedProfile[0] },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
