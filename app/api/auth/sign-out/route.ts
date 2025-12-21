import { lucia, validateRequest } from "@/lib/lucia";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Using POST for sign-out is generally safer to prevent CSRF via GET requests if triggered by a link.
// However, Lucia's validateRequest and session invalidation is secure.
// For simplicity with a button/link, GET can be used if CSRF is handled or deemed low risk for logout.
// Let's use POST.
export async function POST() {
  const { session } = await validateRequest();
  if (!session) {
    // Already signed out or invalid session
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  // No need to redirect from API, client will handle this
  return NextResponse.json(
    { message: "Signed out successfully" },
    { status: 200 }
  );
}
