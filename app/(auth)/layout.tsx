import { validateRequest } from "@/lib/lucia";
import { redirect } from "next/navigation";
import React from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  if (user) {
    // If user is already logged in, redirect from /login or /register
    return redirect("/profile");
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
