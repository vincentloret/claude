import { getFoyers } from "@/lib/queries";
import { Avatar } from "@/components/Avatar";

export default async function FoyerPage() {
  const foyers = await getFoyers();
  return (
    <div className="mx-auto max-w-2xl p-5 md:p-8">
      <h1 className="mb-1 text-xl font-medium md:text-2xl">Mon foyer</h1>
      <p className="mb-6 text-sm text-on-surface-variant">
        Gestion du foyer — écran complémentaire, pas encore maquetté. Liste des foyers de la
        famille en lecture seule pour l&apos;instant.
      </p>
      <div className="flex flex-col gap-2">
        {foyers.map((f) => (
          <div key={f.id} className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface p-3.5">
            <Avatar foyer={f} size={38} />
            <span className="font-medium">{f.nom}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
