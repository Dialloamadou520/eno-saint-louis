import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { seDeconnecter } from "@/app/auth-actions";
import { ROLES } from "@/lib/constants";
import { nomComplet } from "@/lib/format";
import type { Profile } from "@/lib/types";

export function Topbar({
  profil,
  notificationsNonLues,
}: {
  profil: Profile | null;
  notificationsNonLues: number;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
      <Link
        href="/notifications"
        className="relative rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {notificationsNonLues > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-semibold text-white">
            {notificationsNonLues > 9 ? "9+" : notificationsNonLues}
          </span>
        ) : null}
      </Link>

      {profil ? (
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {(profil.prenom[0] ?? "?").toUpperCase()}
            {(profil.nom[0] ?? "").toUpperCase()}
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-medium text-slate-900">
              {nomComplet(profil)}
            </span>
            <span className="block text-xs text-slate-500">
              {ROLES[profil.role]}
            </span>
          </span>
        </div>
      ) : null}

      <form action={seDeconnecter}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="size-[18px]" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </form>
    </header>
  );
}
