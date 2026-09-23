import Link from "next/link";
import { Icon } from "./Icon";
import { ajouterJours, jourEtMois } from "@/lib/jours";

export function EnTeteSemaine({ lundi, sousTitre, base = "/semaine", actions }: { lundi: string; sousTitre: string; base?: string; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-center gap-x-2 gap-y-3 pr-14 md:pr-16">
      <div className="flex items-center">
        <Link href={`${base}/${ajouterJours(lundi, -7)}`} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-surface-container-high" aria-label="Semaine précédente">
          <Icon name="chevron_left" />
        </Link>
        <Link href={`${base}/${ajouterJours(lundi, 7)}`} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-surface-container-high" aria-label="Semaine suivante">
          <Icon name="chevron_right" />
        </Link>
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-[22px] leading-7 md:text-[28px] md:leading-9">Semaine du {jourEtMois(lundi)}</h1>
        <p className="text-sm text-on-surface-variant">{sousTitre}</p>
      </div>
      {actions}
    </header>
  );
}
