"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Boshqaruv" },
  { href: "/admin/items", label: "Tovarlar" },
  { href: "/admin/warehouses", label: "Omborlar" },
  { href: "/admin/operators", label: "Operatorlar" },
  { href: "/admin/reports", label: "Hisobot" },
];

export function AdminNav({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="card mb-6 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Admin panel</p>
          <p className="text-sm text-muted">{username}</p>
        </div>
        <button type="button" className="btn btn-secondary text-sm" onClick={() => void logout()}>
          Chiqish
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium",
              pathname === link.href
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
