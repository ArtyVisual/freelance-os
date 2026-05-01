import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";


// 🔹 GET ALL PAYMENTS
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json([], { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    let whereCondition = {};

    // 🔥 role-based filtering
    if (user.role === "client") {
      whereCondition = {
        project: {
          client: {
            userId: user.id,
          },
        },
      };
    } else {
      whereCondition = {
        project: {
          createdBy: user.id,
        },
      };
    }

    const payments = await prisma.payment.findMany({
      where: whereCondition,
      include: {
        project: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(payments);

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}


// 🔹 CREATE PAYMENT
export async function POST(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { projectId, amount } = body;

        if (!projectId || !amount) {
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            );
        }

        const amt = Number(amount);

        if (isNaN(amt)) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const payment = await prisma.payment.create({
            data: {
                projectId,
                amount: amt,
            },
        });

        // 🔥 AUTO UPDATE PROJECT PAID
        const total = await prisma.payment.aggregate({
            where: { projectId },
            _sum: { amount: true },
        });

        await prisma.project.update({
            where: { id: projectId },
            data: {
                paid: total._sum.amount || 0,
            },
        });

        return NextResponse.json(payment);

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Payment failed" },
            { status: 500 }
        );
    }
}

// 🔹 UPDATE PAYMENT
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, amount } = body;

        if (!id || !amount) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const updated = await prisma.payment.update({
            where: { id },
            data: { amount: Number(amount) },
        });

        // 🔥 recalc project.paid
        const total = await prisma.payment.aggregate({
            where: { projectId: updated.projectId },
            _sum: { amount: true },
        });

        await prisma.project.update({
            where: { id: updated.projectId },
            data: { paid: total._sum.amount || 0 },
        });

        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}


// 🔹 DELETE PAYMENT
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        // get projectId before delete
        const existing = await prisma.payment.findUnique({ where: { id } });

        await prisma.payment.delete({ where: { id } });

        if (existing) {
            const total = await prisma.payment.aggregate({
                where: { projectId: existing.projectId },
                _sum: { amount: true },
            });

            await prisma.project.update({
                where: { id: existing.projectId },
                data: { paid: total._sum.amount || 0 },
            });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}