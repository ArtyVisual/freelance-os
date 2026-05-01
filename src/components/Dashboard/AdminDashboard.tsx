"use client";

import { useQuery } from "@tanstack/react-query";
import Loader from "../Loader";

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

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      return res.json();
    },
  });

  const { data: insights } = useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const res = await fetch("/api/insights");
      return res.json();
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-4 gap-6">

        <div className="card center-card ">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <h2 className="text-2xl font-bold text-green-400">
            ₹ {data.totalRevenue}
          </h2>
        </div>

        <div className="card center-card ">
          <p className="text-gray-400 text-sm">Pending Amount</p>
          <h2 className="text-2xl font-bold text-yellow-400">
            ₹ {data.totalPending}
          </h2>
        </div>

        <div className="card center-card ">
          <p className="text-gray-400 text-sm">Completed</p>
          <h2 className="text-2xl font-bold text-blue-400">
            {data.completed}
          </h2>
        </div>

        <div className="card center-card ">
          <p className="text-gray-400 text-sm">Overdue</p>
          <h2 className="text-2xl font-bold text-red-400">
            {data.overdue}
          </h2>
        </div>

      </div>

      {/*cHARTS */}
      <div className="grid grid-cols-2 gap-6 mt-6">

        {/* LINE CHART */}
        <div className="card project-card">
          <p className="text-gray-400 mb-5">Monthly Revenue</p>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.monthlyRevenue}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART */}
        <div className="card project-card">
          <p className="text-gray-400 mb-3">Project Status</p>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
              >
                <Cell fill="#22c55e" />
                <Cell fill="#eab308" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div className="card project-card mt-6">
        <p className="text-gray-400 mb-3">Insights</p>

        {insights?.length ? (
          insights.map((i: string, idx: number) => (
            <p key={idx} className="text-sm mb-2">
              {i}
            </p>
          ))
        ) : (
          <p className="text-sm text-gray-500">No insights</p>
        )}
      </div>

    </div>
  );
}