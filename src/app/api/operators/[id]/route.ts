import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emptyToNull } from "@/lib/utils";
import { operatorSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = operatorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const operator = await prisma.operator.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        telegram: emptyToNull(data.telegram),
        isActive: data.isActive,
        warehouseId: emptyToNull(data.warehouseId),
      },
    });

    return NextResponse.json(operator);
  } catch {
    return NextResponse.json(
      { error: "Operatorni yangilashda xatolik" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.operator.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Operatorni o‘chirishda xatolik" },
      { status: 400 }
    );
  }
}
