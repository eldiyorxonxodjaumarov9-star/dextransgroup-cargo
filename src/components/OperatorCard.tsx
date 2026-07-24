import { Phone, Send } from "lucide-react";

type OperatorCardProps = {
  operator: {
    name: string;
    phone: string;
    telegram: string | null;
  };
};

export function OperatorCard({ operator }: OperatorCardProps) {
  const phoneHref = `tel:${operator.phone.replace(/[^\d+]/g, "")}`;
  const telegramHref = operator.telegram
    ? operator.telegram.startsWith("http")
      ? operator.telegram
      : `https://t.me/${operator.telegram.replace("@", "")}`
    : null;

  return (
    <article className="min-w-0 rounded-[24px] border border-border bg-card p-4 shadow-[0_18px_40px_-30px_rgba(8,32,64,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-28px_rgba(8,32,64,0.4)] sm:p-5">
      <div className="mb-5 min-w-0">
        <h3 className="break-words text-lg font-bold text-[var(--brand-ink)] dark:text-foreground">
          {operator.name}
        </h3>
        <p className="text-sm text-muted">Operator</p>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href={phoneHref}
          title={operator.phone}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-teal)] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[rgba(8,112,104,0.25)] transition hover:bg-[var(--brand-teal-dark)]"
        >
          <Phone size={16} className="shrink-0" />
          <span className="break-all">{operator.phone}</span>
        </a>

        {telegramHref && (
          <a
            href={telegramHref}
            target="_blank"
            rel="noreferrer"
            title={operator.telegram || undefined}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#229ED9] px-4 py-3 text-sm font-bold text-white shadow-md shadow-sky-500/20 transition hover:bg-[#1b8fc7]"
          >
            <Send size={16} className="shrink-0" />
            <span className="break-all">{operator.telegram}</span>
          </a>
        )}
      </div>
    </article>
  );
}
