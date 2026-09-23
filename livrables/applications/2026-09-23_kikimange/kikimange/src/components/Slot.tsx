import Link from "next/link";
import { Icon } from "./Icon";
import { AvatarPile } from "./Avatar";
import { libelleCreneau, type Creneau } from "@/lib/jours";
import { PARENTS_LIBELLE } from "@/lib/couverts";

export type SlotAffichage = {
  creneau: Creneau;
  presents: { id: string; nom: string; initiales: string; couleur: string }[];
  autres: number; // personnes non affichées en avatar : accompagnants, +N, invités
  couverts: number;
  couvertsParents: number;
  parentsAbsents: boolean;
  ouvert: boolean;
  menuAnnonce: string | null;
  moi: boolean; // l'enfant connecté vient
  passe: boolean;
  periode: boolean; // la participation de l'enfant connecté fait partie d'une période
};

type Props = {
  slot: SlotAffichage;
  vue: "enfant" | "parent";
  onClick?: () => void;
  href?: string;
  className?: string;
  ariaLabel: string;
};

export function IconeCreneau({ creneau, size = 18, neutre = false }: { creneau: Creneau; size?: number; neutre?: boolean }) {
  return (
    <Icon
      name={creneau === "dejeuner" ? "light_mode" : "dark_mode"}
      size={size}
      className={neutre ? "" : creneau === "dejeuner" ? "text-lunch" : "text-dinner"}
    />
  );
}

function ligneCouverts(slot: SlotAffichage, vue: "enfant" | "parent") {
  if (slot.parentsAbsents && slot.couverts === 0) return vue === "parent" ? "Aucun inscrit" : "Tu peux venir";
  if (slot.presents.length === 0 && slot.autres === 0) {
    if (vue === "parent") return slot.parentsAbsents ? "Aucun inscrit" : `Vous ${slot.couverts}`;
    return `${PARENTS_LIBELLE.replace(" et ", ", ")} · ${slot.couverts} couv.`;
  }
  return vue === "parent" && slot.couvertsParents > 0 ? `${slot.couverts} couv. dont vous ${slot.couvertsParents}` : `${slot.couverts} couv.`;
}

export function Slot({ slot, vue, onClick, href, className = "", ariaLabel }: Props) {
  const fond = slot.moi
    ? "bg-primary-container text-on-primary-container"
    : slot.parentsAbsents
      ? "hachures text-away"
      : "bg-surface-container";
  const contour = slot.ouvert ? "ring-2 ring-tertiary" : slot.moi ? "ring-1 ring-primary/40" : "";

  const contenu = (
    <>
      {slot.ouvert && (
        <span className="absolute -top-2.5 left-2 flex max-w-[calc(100%-16px)] items-center gap-1 truncate rounded-full bg-tertiary px-2 py-0.5 text-[11px] font-medium text-white">
          <Icon name="restaurant" size={12} />
          <span className="truncate">{slot.menuAnnonce ?? "Repas ouvert"}</span>
        </span>
      )}
      <span className="flex items-center justify-between gap-1">
        <span className={`flex items-center gap-1 text-xs font-medium ${slot.moi ? "" : "text-on-surface-variant"}`}>
          {slot.parentsAbsents && !slot.moi ? <Icon name="flight_takeoff" size={16} /> : <IconeCreneau creneau={slot.creneau} size={16} neutre={slot.moi} />}
          {libelleCreneau(slot.creneau)}
        </span>
        {vue === "enfant" && !slot.passe &&
          (slot.moi ? (
            <span className="flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-on-primary">
              <Icon name={slot.periode ? "date_range" : "check"} size={12} />
              Toi
            </span>
          ) : (
            <Icon name="add_circle" size={20} className="text-outline" />
          ))}
      </span>
      <span className="flex min-h-6 items-end justify-between gap-1">
        {slot.presents.length > 0 || slot.autres > 0 ? (
          <AvatarPile
            membres={slot.presents}
            autres={slot.autres}
            size={22}
            anneau={slot.moi ? "var(--md-primary-container)" : "var(--md-surface-container)"}
          />
        ) : (
          <span />
        )}
      </span>
      <span className={`text-[11px] leading-tight ${slot.moi ? "" : "text-on-surface-variant"}`}>
        {slot.parentsAbsents && slot.couverts === 0 && vue === "enfant" ? "Absents, tu peux venir" : ligneCouverts(slot, vue)}
      </span>
    </>
  );

  const classes = `relative flex min-h-[92px] w-full flex-col justify-between gap-1.5 rounded-2xl p-2.5 text-left transition-all ${fond} ${contour} ${
    slot.passe ? "opacity-55" : "hover:brightness-[0.97] active:scale-[0.98]"
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {contenu}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={slot.passe || !onClick} className={classes} aria-label={ariaLabel}>
      {contenu}
    </button>
  );
}
