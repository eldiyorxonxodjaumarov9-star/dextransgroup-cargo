import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAdminSession } from "@/lib/auth";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { CargoCategory, CargoStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status")?.trim();
  const category = searchParams.get("category")?.trim();
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();

  const items = await prisma.cargoItem.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { trackNumber: { contains: q } },
                { notes: { contains: q } },
              ],
            }
          : {},
        status ? { status } : {},
        category ? { category } : {},
        from || to
          ? {
              date: {
                gte: from ? new Date(from) : undefined,
                lte: to ? new Date(`${to}T23:59:59`) : undefined,
              },
            }
          : {},
      ],
    },
    select: {
      name: true,
      trackNumber: true,
      category: true,
      status: true,
      date: true,
      warehouse: { select: { name: true } },
      operator: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  const rows = items.map((item) => ({
    "Tovar nomi": item.name,
    "Trek raqami": item.trackNumber,
    Kategoriya: CATEGORY_LABELS[item.category as CargoCategory] || item.category,
    Holati: STATUS_LABELS[item.status as CargoStatus] || item.status,
    Ombor: item.warehouse?.name || "",
    Sana: formatDate(item.date),
    Operator: item.operator?.name || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hisobot");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="dextrans-cargo-hisobot.xlsx"',
    },
  });
}
