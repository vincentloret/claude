type AvatarProps = {
  membre: { nom: string; initiales: string; couleur: string };
  size?: number;
  anneau?: string; // couleur du liseré qui détache l'avatar de son fond (piles)
};

export function Avatar({ membre, size = 32, anneau }: AvatarProps) {
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full font-medium text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: membre.couleur,
        fontSize: Math.round(size * 0.4),
        letterSpacing: "0.02em",
        boxShadow: anneau ? `0 0 0 2px ${anneau}` : undefined,
      }}
      title={membre.nom}
    >
      {membre.initiales}
    </span>
  );
}

/**
 * Au plus 2 avatars entiers, légèrement chevauchés, puis une pastille « +N » pour les autres personnes
 * (autres enfants, accompagnants, invités). Les initiales restent toujours lisibles.
 */
export function AvatarPile({
  membres,
  autres = 0,
  size = 24,
  anneau = "var(--md-surface-container)",
}: {
  membres: { id: string; nom: string; initiales: string; couleur: string }[];
  autres?: number;
  size?: number;
  anneau?: string;
}) {
  const visibles = membres.slice(0, 2);
  const reste = membres.length - visibles.length + autres;
  return (
    <span className="flex items-center">
      {visibles.map((m, i) => (
        <span key={m.id} style={{ marginLeft: i === 0 ? 0 : -2 }}>
          <Avatar membre={m} size={size} anneau={anneau} />
        </span>
      ))}
      {reste > 0 && (
        <span
          className="ml-1 flex items-center justify-center rounded-full bg-surface-container-highest px-1.5 font-medium text-on-surface-variant"
          style={{ height: size, fontSize: Math.round(size * 0.42) }}
        >
          +{reste}
        </span>
      )}
    </span>
  );
}
