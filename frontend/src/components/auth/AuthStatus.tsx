"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { AuthButtons } from "./AuthButtons";
import { UserMenu } from "./UserMenu";

/**
 * Shows either auth buttons (login/register) or user menu based on auth state
 */
export function AuthStatus() {
  const { isAuthenticated, isLoading } = useKindeBrowserClient();

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return <AuthButtons />;
}
