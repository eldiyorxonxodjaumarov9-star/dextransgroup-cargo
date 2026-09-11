import { prisma } from "@/lib/prisma";
import { guestServicesText } from "@/lib/telegram/messages";

/** Active guest-service titles from the same DB the website uses. */
export async function getGuestServicesBotText() {
  const rows = await prisma.guestServiceMedia.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 20,
    select: { title: true, kind: true },
  });

  const titles = rows
    .map((row) => row.title?.trim())
    .filter((title): title is string => Boolean(title));

  // Prefer unique titles while preserving order
  const unique: string[] = [];
  for (const title of titles) {
    if (!unique.includes(title)) unique.push(title);
  }

  return guestServicesText(unique);
}
