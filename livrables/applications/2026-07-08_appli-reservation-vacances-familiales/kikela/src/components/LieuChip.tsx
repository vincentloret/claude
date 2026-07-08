import type { Lieu } from "@/lib/data";
import { Icon } from "./Icon";

type LieuChipProps = {
  lieu: Lieu;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
};

export function LieuChip({ lieu, selected = true, onClick, size = "md" }: LieuChipProps) {
  const isButton = !!onClick;
  const Tag = isButton ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`inline-flex flex-none items-center gap-1.5 rounded-xl font-medium transition-opacity ${
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-11 px-3 text-sm"
      } ${selected ? "" : "opacity-45"}`}
      style={{
        backgroundColor: lieu.couleurContainer,
        color: lieu.couleurOnContainer,
      }}
    >
      <Icon name={lieu.icone} size={size === "sm" ? 18 : 20} style={{ color: lieu.couleur }} />
      {lieu.nom}
    </Tag>
  );
}
