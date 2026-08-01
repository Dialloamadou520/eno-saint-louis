"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";
import { NAV_GROUPS } from "./nav-items";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar({ estAdmin }: { estAdmin: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  const pathname = usePathname();

  const contenu = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-6">
      <Link
        href="/tableau-de-bord"
        className="flex items-center gap-3 px-2"
        onClick={() => setOuvert(false)}
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white">
          <ShieldCheck className="size-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-white">
            {SITE.name}
          </span>
          <span className="block text-xs text-slate-400">Plateforme interne</span>
        </span>
      </Link>

      {NAV_GROUPS.map((groupe) => {
        const items = groupe.items.filter((i) => !i.adminSeulement || estAdmin);
        if (items.length === 0) return null;
        return (
          <div key={groupe.titre}>
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {groupe.titre}
            </p>
            <ul className="space-y-1">
              {items.map((item) => {
                const actif =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOuvert(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        actif
                          ? "bg-brand-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <Icon className="size-[18px] shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="fixed left-4 top-3.5 z-30 rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </button>

      <aside className="hidden w-64 shrink-0 bg-slate-900 lg:block">
        <div className="sticky top-0 h-screen">{contenu}</div>
      </aside>

      {ouvert ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setOuvert(false)}
          />
          <div className="relative h-full w-72 bg-slate-900">
            <button
              type="button"
              onClick={() => setOuvert(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Fermer le menu"
            >
              <X className="size-5" />
            </button>
            {contenu}
          </div>
        </div>
      ) : null}
    </>
  );
}
