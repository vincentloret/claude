import type { Lieu } from "@/lib/data";

const placeholderGradients: Record<string, string> = {
  bolquere: "repeating-linear-gradient(135deg,#DCE7DE 0 13px,#D0E0D2 13px 26px)",
  gedre: "repeating-linear-gradient(135deg,#E4E2F0 0 13px,#D9D6EA 13px 26px)",
  "saint-gilles": "repeating-linear-gradient(135deg,#D5E6F2 0 13px,#C8DCEC 13px 26px)",
};

type LieuVisualProps = {
  lieu: Lieu;
  index?: number;
  className?: string;
};

// Affiche la photo réelle du lieu (ajoutée via Prisma Studio) si elle existe,
// sinon un dégradé placeholder décoratif propre à chaque lieu.
export function LieuVisual({ lieu, index = 0, className }: LieuVisualProps) {
  const url = lieu.photos[index];

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- URLs externes arbitraires (Google Photos, Imgur…)
    return <img src={url} alt={lieu.nom} className={`object-cover ${className ?? ""}`} />;
  }

  return (
    <div
      className={className}
      style={{ background: placeholderGradients[lieu.id] ?? "repeating-linear-gradient(135deg,#E5E5E5 0 13px,#DADADA 13px 26px)" }}
    />
  );
}
