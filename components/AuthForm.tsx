"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string[] | undefined
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);

    const endpoint =
      mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      mode === "login" ? { email, password } : { username, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `An error occurred during ${mode}.`);
        if (data.details) {
          setFieldErrors(data.details);
        }
      } else {
        router.push("/profile"); // Redirect to profile on success
        router.refresh(); // Important to re-fetch server components and update auth state
      }
    } catch (err) {
      console.error(err);
      setError(`An unexpected error occurred. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field: string) => fieldErrors?.[field]?.[0];

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-8">
      <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">
        {mode === "login" ? "Welcome Back!" : "Create Your Account"}
      </h2>
      {error && (
        <p className="mb-4 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === "register" && (
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
            />
            {getFieldError("username") && (
              <p className="mt-1 text-xs text-red-500">
                {getFieldError("username")}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
          />
          {getFieldError("email") && (
            <p className="mt-1 text-xs text-red-500">
              {getFieldError("email")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
          />
          {getFieldError("password") && (
            <p className="mt-1 text-xs text-red-500">
              {getFieldError("password")}
            </p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed dark:focus:ring-offset-slate-800"
          >
            {isLoading
              ? "Processing..."
              : mode === "login"
              ? "Sign In"
              : "Sign Up"}
          </button>
        </div>
        <div className="text-sm text-center">
          {mode === "login" ? (
            <p className="text-slate-600 dark:text-slate-400">
              No account?{" "}
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Register here
              </Link>
            </p>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Login here
              </Link>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
