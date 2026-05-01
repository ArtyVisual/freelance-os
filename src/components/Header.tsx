"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

type HeaderProps = {
  user?: string | null;
};

export default function Header({ user }: HeaderProps) {
  
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-between px-3 lg:px-6 py-3 border-b border-gray-800 bg-gray-900">

      <div>
        <h1 className="pl-12 lg:pl-0 pt-1 text-lg font-semibold text-blue-300 m-0 hidden sm:block">
          AI-Powered Freelance Revenue & Risk Management System
        </h1>
        <h1 className="pl-14 pt-1 text-md font-semibold text-blue-300 m-0 sm:hidden">
          AI-Powered Freelance
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div  className="text-end text-sm">
            <p>{user || "User"}</p>
            <p className="capitalize text-xs"><i>{(session?.user as any)?.role}</i></p>
        </div>
        <button
          onClick={() => signOut()}
          className="px-2 md:px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}