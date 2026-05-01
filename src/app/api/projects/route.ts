import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// 🔹 GET ALL PROJECTS
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
        client: {
          userId: user.id,
        },
      };
    } else {
      whereCondition = {
        createdBy: user.id,
      };
    }

    const projects = await prisma.project.findMany({
      where: whereCondition,
      include: {
        client: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const projectsWithRisk = projects.map((p) => {
      let risk = 0;

      // low payment risk
      if ((p.budget || 0) > 0 && p.paid < (p.budget || 0) * 0.5) {
        risk += 50;
      }

      // overdue risk
      if (p.deadline && new Date(p.deadline) < new Date()) {
        risk += 50;
      }

      return {
        ...p,
        riskScore: risk, // 👈 attach here
      };
    });

    return NextResponse.json(projectsWithRisk);

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// 🔹 CREATE PROJECT
export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const body = await req.json();
    const { title, budget, paid, deadline, clientId } = body;

    const project = await prisma.project.create({
      data: {
        title,
        budget: Number(budget),
        paid: paid ? Number(paid) : 0,
        deadline: deadline ? new Date(deadline) : null,
        clientId,
        createdBy: user!.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}

// 🔹 UPDATE PROJECT
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const project = await prisma.project.update({
      where: { id: body.id },
      data: {
        title: body.title,
        budget: Number(body.budget),
        paid: Number(body.paid || 0),
        deadline: body.deadline ? new Date(body.deadline) : null,
        clientId: body.clientId,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// 🔹 DELETE PROJECT
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}