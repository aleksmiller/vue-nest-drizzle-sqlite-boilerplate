"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/sign-out", { method: "POST" });
      if (res.ok) {
        router.push("/login"); // Redirect to login page
        router.refresh(); // Ensure auth state is updated globally
      } else {
        // Handle error, e.g., show a notification
        console.error("Sign out failed");
        alert("Sign out failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      alert("An error occurred during sign out.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 dark:focus:ring-offset-slate-800"
    >
      {isLoading ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
