import { validateRequest } from "@/lib/lucia";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";
import SignOutButton from "@/components/SignOutButton"; // We will create this

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = await validateRequest();

  if (!user || !session) {
    return redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-100 dark:bg-slate-800 shadow-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-xl font-semibold text-indigo-600 dark:text-indigo-400"
          >
            MyApp
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Hi, {user.username}!
            </span>
            <Link
              href="/profile"
              className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Profile
            </Link>
            <SignOutButton />
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-slate-100 dark:bg-slate-800 text-center py-4 text-xs text-slate-600 dark:text-slate-400">
        © {new Date().getFullYear()} MyApp Inc.
      </footer>
    </div>
  );
}
