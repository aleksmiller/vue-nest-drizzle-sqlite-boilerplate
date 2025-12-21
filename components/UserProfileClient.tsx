"use client";

import { UserProfileSchema, UserSchema } from "@/db/schema";
import { profileUpdateSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";

type ProfileFormData = z.infer<typeof profileUpdateSchema>;

interface UserProfileClientProps {
  initialUser: Omit<UserSchema, "hashedPassword">;
  initialProfile: UserProfileSchema | null;
}

export default function UserProfileClient({
  initialUser,
  initialProfile,
}: UserProfileClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userDate, setUserDate] = useState<string | null>(null);
  const [profileDate, setProfileDate] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: initialProfile?.firstName ?? "",
      lastName: initialProfile?.lastName ?? "",
      bio: initialProfile?.bio ?? "",
    },
  });

  // Reset form if initialProfile changes (e.g. after successful update)
  useEffect(() => {
    reset({
      firstName: initialProfile?.firstName ?? "",
      lastName: initialProfile?.lastName ?? "",
      bio: initialProfile?.bio ?? "",
    });
  }, [initialProfile, reset]);

  useEffect(() => {
    setUserDate(new Date(initialUser.createdAt).toLocaleDateString());
  }, [initialUser]);

  useEffect(() => {
    if (initialProfile?.updatedAt) {
      setProfileDate(new Date(initialProfile.updatedAt).toLocaleDateString());
    }
  }, [initialProfile]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update profile.");
      }
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      router.refresh(); // Re-fetch server components to get updated profile data
    } catch (error: unknown) {
      setServerError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          User Profile
        </h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 text-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      {serverError && (
        <p className="mb-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded">
          {serverError}
        </p>
      )}
      {successMessage && (
        <p className="mb-4 text-sm text-green-600 bg-green-100 dark:bg-green-900/30 p-3 rounded">
          {successMessage}
        </p>
      )}

      <div className="space-y-3 text-sm sm:text-base">
        <p>
          <strong className="font-medium text-slate-700 dark:text-slate-300">
            Username:
          </strong>{" "}
          {initialUser.username}
        </p>
        <p>
          <strong className="font-medium text-slate-700 dark:text-slate-300">
            Email:
          </strong>{" "}
          {initialUser.email}
        </p>
        <p>
          <strong className="font-medium text-slate-700 dark:text-slate-300">
            Joined:
          </strong>{" "}
          {userDate}
        </p>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              {...register("firstName")}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              {...register("lastName")}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              {...register("bio")}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-70 text-sm"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                reset(); // Reset form to default values
                setServerError(null);
                setSuccessMessage(null);
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 focus:outline-none text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8 space-y-3 text-sm sm:text-base">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Profile Details
          </h2>
          <p>
            <strong className="font-medium text-slate-700 dark:text-slate-300">
              First Name:
            </strong>{" "}
            {initialProfile?.firstName || (
              <span className="italic text-slate-500 dark:text-slate-400">
                Not set
              </span>
            )}
          </p>
          <p>
            <strong className="font-medium text-slate-700 dark:text-slate-300">
              Last Name:
            </strong>{" "}
            {initialProfile?.lastName || (
              <span className="italic text-slate-500 dark:text-slate-400">
                Not set
              </span>
            )}
          </p>
          <p>
            <strong className="font-medium text-slate-700 dark:text-slate-300">
              Bio:
            </strong>{" "}
            {initialProfile?.bio || (
              <span className="italic text-slate-500 dark:text-slate-400">
                Not set
              </span>
            )}
          </p>
          {initialProfile?.updatedAt && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Last updated:{" "}
              {profileDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
