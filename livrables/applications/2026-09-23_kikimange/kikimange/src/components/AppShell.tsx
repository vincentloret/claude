"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";
import { BrandMark } from "./BrandMark";
import { changerMembre } from "@/lib/actions";
import type { MembreVue } from "@/lib/types";

type NavItem = { href: string; label: string; icon: string };

const NAV_ENFANT: NavItem[] = [
  { href: "/semaine", label: "Semaine", icon: "calendar_view_week" },
  { href: "/mois", label: "Mois", icon: "calendar_month" },
  { href: "/accompagnants", label: "Accompagnants", icon: "group" },
];

const NAV_PARENT: NavItem[] = [
  { href: "/semaine", label: "Semaine", icon: "calendar_view_week" },
  { href: "/mois", label: "Mois", icon: "calendar_month" },
  { href: "/courses", label: "Courses", icon: "shopping_basket" },
];

function MenuCompte({ membre }: { membre: MembreVue }) {
  const [ouvert, setOuvert] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    function clic(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false);
    }
    function touche(e: KeyboardEvent) {
      if (e.key === "Escape") setOuvert(false);
    }
    document.addEventListener("mousedown", clic);
    document.addEventListener("keydown", touche);
    return () => {
      document.removeEventListener("mousedown", clic);
      document.removeEventListener("keydown", touche);
    };
  }, [ouvert]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOuvert((o) => !o)}
        className="flex h-12 w-12 items-center justify-center rounded-full transition-transform active:scale-95"
        aria-label="Mon compte"
        aria-expanded={ouvert}
      >
        <Avatar membre={membre} size={36} />
      </button>
      {ouvert && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-40 w-60 overflow-hidden rounded-xl bg-surface-container shadow-lg">
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar membre={membre} size={36} />
            <div>
              <div className="font-medium">{membre.nom}</div>
              <div className="text-xs text-on-surface-variant">{membre.role === "parent" ? "Parent" : "Enfant"}</div>
            </div>
          </div>
          <div className="border-t border-outline-variant" />
          {membre.role === "parent" && (
            <Link
              href="/reglages"
              onClick={() => setOuvert(false)}
              className="flex h-12 items-center gap-3 px-4 hover:bg-surface-container-high"
            >
              <Icon name="settings" size={20} className="text-on-surface-variant" />
              Réglages
            </Link>
          )}
          <button
            onClick={() => startTransition(() => changerMembre())}
            disabled={isPending}
            className="flex h-12 w-full items-center gap-3 px-4 text-left hover:bg-surface-container-high disabled:opacity-60"
          >
            <Icon name="switch_account" size={20} className="text-on-surface-variant" />
            Changer de personne
          </button>
        </div>
      )}
    </div>
  );
}

function EntreeNav({ item, actif, variante }: { item: NavItem; actif: boolean; variante: "rail" | "barre" }) {
  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center gap-1 ${variante === "rail" ? "w-full py-1.5" : "flex-1 pt-3 pb-4"}`}
      aria-current={actif ? "page" : undefined}
    >
      <span
        className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
          actif ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant"
        }`}
      >
        <Icon name={item.icon} filled={actif} />
      </span>
      <span className={`text-xs ${actif ? "font-bold text-on-surface" : "font-medium text-on-surface-variant"}`}>
        {item.label}
      </span>
    </Link>
  );
}

export function AppShell({ children, membre }: { children: React.ReactNode; membre: MembreVue }) {
  const pathname = usePathname() ?? "";
  const nav = membre.role === "parent" ? NAV_PARENT : NAV_ENFANT;
  const estActif = (href: string) => pathname.startsWith(href);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Rail de navigation — desktop */}
      <nav className="sticky top-0 hidden h-screen w-24 flex-none flex-col items-center gap-2 bg-surface-container-high py-4 md:flex">
        <Link href="/semaine" className="mb-4" aria-label="Kikimange, accueil">
          <BrandMark />
        </Link>
        {nav.map((item) => (
          <EntreeNav key={item.href} item={item} actif={estActif(item.href)} variante="rail" />
        ))}
        {membre.role === "parent" && (
          <div className="mt-auto w-full">
            <EntreeNav item={{ href: "/reglages", label: "Réglages", icon: "settings" }} actif={estActif("/reglages")} variante="rail" />
          </div>
        )}
      </nav>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="absolute right-2 top-2 z-30 md:right-6 md:top-5">
          <MenuCompte membre={membre} />
        </div>
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
      </div>

      {/* Barre de navigation — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex bg-surface-container-high pb-[env(safe-area-inset-bottom,0px)] md:hidden">
        {nav.map((item) => (
          <EntreeNav key={item.href} item={item} actif={estActif(item.href)} variante="barre" />
        ))}
      </nav>
    </div>
  );
}
