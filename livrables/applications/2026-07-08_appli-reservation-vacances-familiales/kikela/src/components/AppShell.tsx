"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";
import { deconnecterGoogle, changerFoyer } from "@/lib/actions";
import type { Foyer } from "@/lib/data";

const navItems = [
  { href: "/planning", label: "Planning", icon: "calendar_month" },
  { href: "/lieux", label: "Lieux", icon: "cottage" },
  { href: "/foyer", label: "Mon foyer", icon: "groups" },
  { href: "/parametres", label: "Réglages", icon: "settings" },
];

function BrandMark() {
  return (
    <div
      className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl"
      style={{ backgroundColor: "var(--md-primary)" }}
    >
      <Icon name="holiday_village" size={24} className="text-white" />
    </div>
  );
}

export function AppShell({ children, foyerConnecte }: { children: React.ReactNode; foyerConnecte: Foyer }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDeconnexion() {
    if (!window.confirm("Déconnecter le compte Google familial ? La synchronisation des calendriers sera interrompue.")) {
      return;
    }
    startTransition(async () => {
      await deconnecterGoogle();
      router.push("/login");
    });
  }

  function handleChangerFoyer() {
    startTransition(async () => {
      await changerFoyer();
    });
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Nav rail — desktop */}
      <nav className="hidden w-22 flex-none flex-col items-center gap-1.5 border-r border-outline-variant bg-surface-container py-3.5 md:flex">
        <div className="mb-3">
          <BrandMark />
        </div>
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex w-full flex-col items-center gap-1 py-1.5"
            >
              <span
                className="flex h-8 w-14 items-center justify-center rounded-2xl transition-transform duration-150 hover:scale-110"
                style={{ backgroundColor: active ? "var(--md-primary-container)" : "transparent" }}
              >
                <Icon
                  name={item.icon}
                  filled={active}
                  style={{ color: active ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)" }}
                />
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: active ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={handleChangerFoyer}
          disabled={isPending}
          className="mt-auto rounded-full transition-transform duration-150 hover:scale-110 active:scale-95 disabled:opacity-60"
          title="Changer de foyer"
          aria-label="Changer de foyer"
        >
          <Avatar foyer={foyerConnecte} size={40} />
        </button>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top app bar */}
        <header className="flex h-14 flex-none items-center gap-3 border-b border-outline-variant px-4 md:h-17 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <BrandMark />
          </div>
          <div className="flex-1 text-lg font-normal md:text-[22px]">Kikela</div>
          <button
            onClick={handleDeconnexion}
            disabled={isPending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high transition-transform duration-150 hover:scale-110 active:scale-95 disabled:opacity-60"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <Icon name="logout" size={20} className="text-on-surface-variant" />
          </button>
          <button
            onClick={handleChangerFoyer}
            disabled={isPending}
            className="rounded-full transition-transform duration-150 active:scale-95 md:hidden disabled:opacity-60"
            title="Changer de foyer"
            aria-label="Changer de foyer"
          >
            <Avatar foyer={foyerConnecte} size={36} />
          </button>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 flex h-[78px] flex-none border-t border-outline-variant bg-surface-container px-1.5 pt-2.5 md:hidden">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-1 flex-col items-center gap-1">
              <span
                className="flex h-7.5 w-15 items-center justify-center rounded-2xl"
                style={{ backgroundColor: active ? "var(--md-primary-container)" : "transparent" }}
              >
                <Icon
                  name={item.icon}
                  filled={active}
                  style={{ color: active ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)" }}
                />
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: active ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
