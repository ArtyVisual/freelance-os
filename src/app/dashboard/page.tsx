"use client";

import AdminDashboard from "@/components/Dashboard/AdminDashboard";
import ClientDashboard from "@/components/Dashboard/ClientDashboard";
import { useSession } from "next-auth/react";

export default function DashboardPage() {

  const { data: session } = useSession();

  if ((session?.user as any)?.role === "client") {
    return <ClientDashboard />;
  }

  return <AdminDashboard />;
}