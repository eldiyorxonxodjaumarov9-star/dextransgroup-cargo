import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminNav";
import { CustomersManager } from "@/components/admin/CustomersManager";
import { getAdminSession } from "@/lib/auth";
import { listCustomers, listPendingClaims } from "@/lib/customer-service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [customers, claims, cargoOptions] = await Promise.all([
    listCustomers({ take: 200 }),
    listPendingClaims(50),
    prisma.cargoItem.findMany({
      select: { id: true, trackNumber: true, customerId: true },
      orderBy: { updatedAt: "desc" },
      take: 300,
    }),
  ]);

  return (
    <AdminShell
      username={session.username}
      title="Mijozlar"
      description="Telegram mijozlari, ownership so‘rovlari va yuk biriktirish."
    >
      <CustomersManager
        customers={customers.map((c) => ({
          id: c.id,
          telegramUserId: String(c.telegramUserId),
          chatId: String(c.chatId),
          firstName: c.firstName,
          lastName: c.lastName,
          username: c.username,
          phone: c.phone,
          normalizedPhone: c.normalizedPhone,
          customerCode: c.customerCode,
          status: c.status,
          _count: c._count,
        }))}
        claims={claims.map((claim) => ({
          id: claim.id,
          status: claim.status,
          createdAt: claim.createdAt.toISOString(),
          telegramCustomer: {
            id: claim.telegramCustomer.id,
            firstName: claim.telegramCustomer.firstName,
            customerCode: claim.telegramCustomer.customerCode,
            normalizedPhone: claim.telegramCustomer.normalizedPhone,
            telegramUserId: String(claim.telegramCustomer.telegramUserId),
          },
          cargoItem: {
            id: claim.cargoItem.id,
            trackNumber: claim.cargoItem.trackNumber,
            name: claim.cargoItem.name,
            status: claim.cargoItem.status,
          },
        }))}
        cargoOptions={cargoOptions}
      />
    </AdminShell>
  );
}
