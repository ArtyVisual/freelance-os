import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🔥 get client profile
    const client = await prisma.client.findFirst({
      where: { userId: user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 🔥 get projects
    const projects = await prisma.project.findMany({
      where: { clientId: client.id },
      include: { payments: true },
    });

    // 🔥 calculations
    let totalPaid = 0;
    let totalBudget = 0;

    projects.forEach((p) => {
      totalBudget += p.budget || 0;
      totalPaid += p.paid || 0;
    });

    // 🔥 recent payments
    const recentPayments = await prisma.payment.findMany({
      where: {
        project: {
          clientId: client.id,
        },
      },
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      projects,
      totalPaid,
      totalRemaining: totalBudget - totalPaid,
      recentPayments,
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}