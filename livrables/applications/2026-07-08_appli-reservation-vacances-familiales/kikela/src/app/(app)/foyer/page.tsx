import { getFoyers, getSejours, getFoyerConnecte, getLieux } from "@/lib/queries";
import { formatPlage } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { SejourCard } from "@/components/SejourCard";
import { Icon } from "@/components/Icon";

export default async function FoyerPage() {
  const [foyers, sejours, foyerConnecte, lieux] = await Promise.all([
    getFoyers(),
    getSejours(),
    getFoyerConnecte(),
    getLieux(),
  ]);

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const sejoursFoyer = sejours.filter((s) => s.foyerId === foyerConnecte.id);
  const aVenir = [...sejoursFoyer]
    .filter((s) => s.fin >= aujourdhui)
    .sort((a, b) => a.debut.localeCompare(b.debut));
  const passes = [...sejoursFoyer]
    .filter((s) => s.fin < aujourdhui)
    .sort((a, b) => b.debut.localeCompare(a.debut));

  const autresFoyers = foyers.filter((f) => f.id !== foyerConnecte.id);

  function nbAVenir(foyerId: string): number {
    return sejours.filter((s) => s.foyerId === foyerId && s.fin >= aujourdhui).length;
  }

  return (
    <div className="mx-auto max-w-2xl p-5 md:p-8">
      <h1 className="mb-1 text-xl font-medium md:text-2xl">Mon foyer</h1>
      <p className="mb-6 text-sm text-on-surface-variant">
        Votre foyer et vos séjours, et un aperçu du reste de la famille.
      </p>

      <div className="mb-8 rounded-2xl border border-outline-variant bg-surface p-4">
        <div className="mb-4 flex items-center gap-3">
          <Avatar foyer={foyerConnecte} size={44} />
          <div className="text-lg font-medium">{foyerConnecte.nom}</div>
        </div>

        <div className="mb-2 text-xs font-medium tracking-wide text-on-surface-muted uppercase">
          Séjours à venir
        </div>
        {aVenir.length === 0 ? (
          <div className="mb-5 text-sm text-on-surface-muted">Aucun séjour à venir.</div>
        ) : (
          <div className="mb-5">
            {aVenir.map((s) => (
              <SejourCard key={s.id} sejour={s} lieux={lieux} foyers={foyers} />
            ))}
          </div>
        )}

        {passes.length > 0 && (
          <>
            <div className="mb-2 text-xs font-medium tracking-wide text-on-surface-muted uppercase">
              Séjours passés
            </div>
            <div className="flex flex-col gap-2">
              {passes.map((s) => {
                const lieu = lieux.find((l) => l.id === s.lieuId);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 rounded-xl bg-surface-container-high px-3 py-2 text-sm text-on-surface-variant"
                  >
                    <Icon name={lieu?.icone ?? "cottage"} size={16} />
                    <span className="flex-1 truncate">{lieu?.nom}</span>
                    <span className="text-xs">{formatPlage(s.debut, s.fin)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="mb-3 text-xs font-medium tracking-wide text-on-surface-muted uppercase">La famille</div>
      <div className="flex flex-col gap-2">
        {autresFoyers.map((f) => {
          const n = nbAVenir(f.id);
          return (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface p-3.5"
            >
              <Avatar foyer={f} size={38} />
              <span className="flex-1 font-medium">{f.nom}</span>
              <span className="text-xs text-on-surface-muted">
                {n} séjour{n > 1 ? "s" : ""} à venir
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
