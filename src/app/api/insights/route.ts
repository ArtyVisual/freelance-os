import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json([], { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json([]);

    const projects = await prisma.project.findMany({
      where:
        user.role === "client"
          ? { client: { userId: user.id } }
          : { createdBy: user.id },
    });

    const insights: string[] = [];

    const today = new Date();

    projects.forEach((p) => {
      // overdue
      if (p.deadline && new Date(p.deadline) < today && p.paid < (p.budget || 0)) {
        insights.push(
          `⚠ ${p.title} is overdue and ₹${p.budget - p.paid} is still pending. Consider following up immediately.`
        );
      }

      // low payment
      if ((p.budget || 0) > 0 && p.paid < (p.budget || 0) * 0.5) {
        insights.push(
          `💡 ${p.title} has received less than 50% payment. This may indicate risk of delay or drop-off.`
        );
      }

      // near deadline
      if (p.deadline) {
        const diff = (new Date(p.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 0 && diff <= 3) {
          insights.push(`⏳ ${p.title} deadline in ${Math.ceil(diff)} days`);
        }
      }
    });

    return NextResponse.json(insights.slice(0, 5));

  } catch {
    return NextResponse.json([], { status: 500 });
  }
}