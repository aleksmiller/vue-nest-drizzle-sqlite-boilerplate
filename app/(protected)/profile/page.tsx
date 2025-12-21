import { validateRequest } from "@/lib/lucia";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { usersTable, userProfilesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import UserProfileClient from "@/components/UserProfileClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | MyApp",
};

// This page is server-rendered initially, then UserProfileClient handles interactions.
export default async function ProfilePage() {
  const { user } = await validateRequest(); // Already validated by layout, but good for direct access defense

  if (!user) {
    // This should ideally be caught by the layout, but as a safeguard:
    return redirect("/login");
  }

  // Fetch the latest user data and profile for initial render
  // The API route /api/user/profile also fetches this, but here we do it server-side for the initial load.
  const dbUser = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, user.id))
    .limit(1);

  if (dbUser.length === 0) {
    // Should not happen if lucia.validateRequest worked
    console.error("User validated by Lucia not found in DB for profile page.");
    return redirect("/login"); // Or an error page
  }

  const dbProfile = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.userId, user.id))
    .limit(1);

  return (
    <UserProfileClient
      initialUser={dbUser[0]}
      initialProfile={dbProfile.length > 0 ? dbProfile[0] : null}
    />
  );
}
