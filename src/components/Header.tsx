"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

type HeaderProps = {
  user?: string | null;
};

export default function Header({ user }: HeaderProps) {
  
  const { data: session } = useSession();

  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-900">

      <div>
        <h1 className="text-lg font-semibold text-blue-300 m-0">
          AI-Powered Freelance Revenue & Risk Management System
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div  className="text-left text-sm">
            <p>{user || "User"}</p>
            <p className="capitalize">{(session?.user as any)?.role}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}