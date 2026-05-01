import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({});
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const projects = await prisma.project.findMany({
      where: { createdBy: user?.id },
    });

    const payments = await prisma.payment.findMany({
      where: {
        project: {
          createdBy: user?.id,
        },
      },
    });

    let totalRevenue = 0;
    let totalPending = 0;
    let completed = 0;
    let overdue = 0;

    projects.forEach((p) => {
      const paid = p.paid || 0;
      const budget = p.budget || 0;

      totalRevenue += paid;
      totalPending += budget - paid;

      if (paid >= budget) completed++;

      if (
        p.deadline &&
        new Date(p.deadline) < new Date() &&
        paid < budget
      ) {
        overdue++;
      }
    });

    // 🔥 Monthly Revenue Chart
    const monthlyMap: any = {};

    payments.forEach((p) => {
      const month = new Date(p.createdAt).toLocaleString("default", {
        month: "short",
      });

      if (!monthlyMap[month]) monthlyMap[month] = 0;
      monthlyMap[month] += p.amount;
    });

    const monthlyRevenue = Object.keys(monthlyMap).map((m) => ({
      name: m,
      revenue: monthlyMap[m],
    }));

    // 🔥 Status Chart
    const statusData = [
      { name: "Completed", value: completed },
      { name: "Pending", value: projects.length - completed },
    ];

    return NextResponse.json({
      totalRevenue,
      totalPending,
      completed,
      overdue,
      monthlyRevenue,
      statusData,
    });

  } catch (err) {
    return NextResponse.json({ error: "Dashboard failed" }, { status: 500 });
  }
}