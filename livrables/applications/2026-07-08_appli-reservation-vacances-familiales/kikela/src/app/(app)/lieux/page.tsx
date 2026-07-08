import Link from "next/link";
import { getLieux } from "@/lib/queries";
import { Icon } from "@/components/Icon";
import { LieuVisual } from "@/components/LieuVisual";

export default async function LieuxPage() {
  const lieux = await getLieux();
  return (
    <div className="mx-auto max-w-4xl p-5 md:p-8">
      <h1 className="mb-5 text-xl font-medium md:text-2xl">Les 3 lieux familiaux</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {lieux.map((lieu) => (
          <Link
            key={lieu.id}
            href={`/lieux/${lieu.slug}`}
            className="overflow-hidden rounded-3xl border border-outline-variant bg-surface"
          >
            <LieuVisual lieu={lieu} className="h-32 w-full" />
            <div className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <Icon name={lieu.icone} style={{ color: lieu.couleur }} />
                <span className="font-medium">{lieu.nom}</span>
              </div>
              <div className="mb-3 text-[13px] text-on-surface-variant">{lieu.region}</div>
              <div
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: lieu.couleurContainer, color: lieu.couleurOnContainer }}
              >
                <Icon name="group" size={15} />
                {lieu.capacite} personnes max.
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
