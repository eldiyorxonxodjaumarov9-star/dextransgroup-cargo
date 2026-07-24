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
    <article className="rounded-[24px] border border-border bg-card p-5 shadow-[0_18px_40px_-30px_rgba(8,32,64,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-28px_rgba(8,32,64,0.4)]">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-[var(--brand-ink)] dark:text-foreground">
          {operator.name}
        </h3>
        <p className="text-sm text-muted">Operator</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={phoneHref}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--brand-teal)] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[rgba(8,112,104,0.25)] transition hover:bg-[var(--brand-teal-dark)]"
        >
          <Phone size={16} />
          {operator.phone}
        </a>

        {telegramHref && (
          <a
            href={telegramHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#229ED9] px-4 py-3 text-sm font-bold text-white shadow-md shadow-sky-500/20 transition hover:bg-[#1b8fc7]"
          >
            <Send size={16} />
            {operator.telegram}
          </a>
        )}
      </div>
    </article>
  );
}
