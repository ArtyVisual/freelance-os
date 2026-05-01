"use client";

import AdminDashboard from "@/components/Dashboard/AdminDashboard";
import ClientDashboard from "@/components/Dashboard/ClientDashboard";
import { useSession } from "next-auth/react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function DashboardPage() {

  const { data: session } = useSession();

  if ((session?.user as any)?.role === "client") {
    return <ClientDashboard />;
  }

  return <AdminDashboard />;
}