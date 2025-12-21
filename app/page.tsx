import { validateRequest } from "@/lib/lucia";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default async function HomePage() {
  const { user } = await validateRequest();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
      <div className="text-center space-y-8 bg-black/30 backdrop-blur-md p-8 sm:p-12 rounded-xl shadow-2xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
          Next.js + Drizzle + SQLite
        </h1>
        <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto">
          A powerful boilerplate featuring robust authentication with Lucia and
          seamless database integration with Drizzle ORM.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          {user ? (
            <>
              <Link
                href="/profile"
                className="inline-block rounded-lg bg-white px-6 py-3 text-base font-medium text-indigo-600 shadow-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 transition-colors"
              >
                Go to Your Profile ({user.username})
              </Link>
              <div className="hidden sm:block">
                <SignOutButton />
              </div>
              <div className="sm:hidden w-full">
                <SignOutButton /> {/* Stack button on mobile */}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-block rounded-lg bg-green-500 px-7 py-3 text-base font-medium text-white shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-purple-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-block rounded-lg bg-sky-500 px-7 py-3 text-base font-medium text-white shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-purple-600 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      <p className="mt-12 text-xs text-indigo-200">© 2025 MyApp Inc.</p>
    </main>
  );
}
