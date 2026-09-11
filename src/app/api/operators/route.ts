import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emptyToNull } from "@/lib/utils";
import { operatorSchema } from "@/lib/validations";

export async function GET() {
  const operators = await prisma.operator.findMany({
    include: { warehouse: true },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(operators);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = operatorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const operator = await prisma.operator.create({
      data: {
        name: data.name,
        phone: data.phone,
        telegram: emptyToNull(data.telegram),
        isActive: data.isActive,
        warehouseId: emptyToNull(data.warehouseId),
      },
    });

    return NextResponse.json(operator, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Operator qo‘shishda xatolik" },
      { status: 400 }
    );
  }
}
