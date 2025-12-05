"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Avatar, Dropdown } from "flowbite-react";
import { getUserDisplayName, getUserInitials, KindeUser } from "@/lib/auth";

export function UserMenu() {
  const { user, isLoading } = useKindeBrowserClient();

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  const kindeUser = user as KindeUser;
  const displayName = getUserDisplayName(kindeUser);
  const initials = getUserInitials(kindeUser);

  return (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        kindeUser.picture ? (
          <Avatar img={kindeUser.picture} rounded size="sm" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            {initials}
          </div>
        )
      }
    >
      <Dropdown.Header>
        <span className="block text-sm font-medium">{displayName}</span>
        {kindeUser.email && (
          <span className="block truncate text-sm text-gray-500">
            {kindeUser.email}
          </span>
        )}
      </Dropdown.Header>
      {/* Settings link will be added later */}
      {/* <Dropdown.Item>Settings</Dropdown.Item> */}
      <Dropdown.Divider />
      <LogoutLink>
        <Dropdown.Item>Sign out</Dropdown.Item>
      </LogoutLink>
    </Dropdown>
  );
}
