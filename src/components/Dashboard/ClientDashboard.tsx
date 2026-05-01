"use client";

import { useQuery } from "@tanstack/react-query";
import Loader from "../Loader";

export default function ClientDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["client-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/client-dashboard");
      return res.json();
    },
  });

  if (isLoading) return <Loader/>;

  return (
    <div className="space-y-6">

      {/* STATS */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <p className="text-gray-400 text-sm">Total Paid</p>
          <h2 className="text-xl font-semibold text-green-400">
            ₹ {data.totalPaid}
          </h2>
        </div>

        <div className="card">
          <p className="text-gray-400 text-sm">Remaining</p>
          <h2 className="text-xl font-semibold text-yellow-400">
            ₹ {data.totalRemaining}
          </h2>
        </div>
      </div>

      {/* PROJECTS */}
      <div>
        <h3 className="mb-3 font-semibold">My Projects</h3>

        <div className="grid grid-cols-2 gap-4">
          {data.projects.map((p: any) => (
            <div key={p.id} className="card">
              <h4 className="font-semibold">{p.title}</h4>

              <p className="text-sm text-gray-400">
                Budget: ₹ {p.budget}
              </p>

              <p className="text-sm text-green-400">
                Paid: ₹ {p.paid}
              </p>

              <p className="text-sm text-yellow-400">
                Remaining: ₹ {p.budget - p.paid}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT PAYMENTS */}
      <div>
        <h3 className="mb-3 font-semibold">Recent Payments</h3>

        <div className="card table-card">
          {data.recentPayments.map((p: any) => (
            <div key={p.id} className="flex justify-between text-sm w-full">
              <span>{p.project.title}</span>
              <span className="text-green-400">₹ {p.amount}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}