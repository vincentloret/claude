import type { Foyer } from "@/lib/data";

type AvatarProps = {
  foyer: Foyer;
  size?: number;
};

export function Avatar({ foyer, size = 32 }: AvatarProps) {
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full font-medium text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: foyer.couleur,
        fontSize: Math.round(size * 0.38),
      }}
      title={foyer.nom}
    >
      {foyer.initiales}
    </span>
  );
}
