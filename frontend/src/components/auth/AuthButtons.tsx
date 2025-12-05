"use client";

import { LoginLink, LogoutLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "flowbite-react";

export function LoginButton({ className = "" }: { className?: string }) {
  return (
    <LoginLink>
      <Button size="sm" className={className}>
        Sign In
      </Button>
    </LoginLink>
  );
}

export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <LogoutLink>
      <Button size="sm" color="gray" className={className}>
        Sign Out
      </Button>
    </LogoutLink>
  );
}

export function RegisterButton({ className = "" }: { className?: string }) {
  return (
    <RegisterLink>
      <Button size="sm" color="light" className={className}>
        Sign Up
      </Button>
    </RegisterLink>
  );
}

export function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <LoginButton />
      <RegisterButton />
    </div>
  );
}
