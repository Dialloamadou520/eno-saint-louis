import { cn } from "@/lib/utils";

type Accent = "brand" | "sky" | "amber" | "violet" | "red" | "slate";

const accents: Record<Accent, string> = {
  brand: "bg-brand-50 text-brand-700",
  sky: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-700",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "brand",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  accent?: Accent;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {icon ? (
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              accents[accent]
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  );
}
