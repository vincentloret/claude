const COULEURS = [
  "var(--lieu-bolquere)",
  "var(--lieu-gedre)",
  "var(--lieu-saint-gilles)",
  "var(--md-primary)",
];

const PARTICULES = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const distance = 70 + (i % 3) * 20;
  return {
    tx: Math.cos(angle) * distance,
    ty: Math.sin(angle) * distance,
    delay: (i % 4) * 40,
    couleur: COULEURS[i % COULEURS.length],
  };
});

/** Petite explosion de confettis CSS, centrée sur son conteneur parent (position: relative requise). */
export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {PARTICULES.map((p, i) => (
        <span
          key={i}
          className="animate-confetti absolute h-2 w-2 rounded-full"
          style={
            {
              backgroundColor: p.couleur,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
