import Link from "next/link";
import { Icon } from "@/components/Icon";
import { EtatVideIllustration } from "@/components/EtatVideIllustration";

function Section({ icone, titre, children }: { icone: string; titre: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <div className="mb-2.5 flex items-center gap-2">
        <Icon name={icone} size={20} style={{ color: "var(--md-primary)" }} />
        <h2 className="text-[15px] font-medium">{titre}</h2>
      </div>
      <div className="max-w-xl text-[15px] leading-relaxed text-[#4A3B34]">{children}</div>
    </section>
  );
}

export default function ModeEmploiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 pb-24 md:px-8 md:pt-8">
      <div className="mb-2 flex items-center gap-3 md:hidden">
        <Link href="/planning" className="rounded-full p-1 transition-transform duration-150 active:scale-90">
          <Icon name="arrow_back" className="text-on-surface-variant" />
        </Link>
        <div className="flex-1 text-lg font-normal">Mode d&apos;emploi</div>
      </div>
      <div className="hidden items-center gap-3 border-b border-outline-variant pb-4 md:flex">
        <Link
          href="/planning"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150 hover:bg-surface-container-high"
        >
          <Icon name="arrow_back" className="text-on-surface-variant" />
        </Link>
        <div className="flex-1 text-xl font-normal">Mode d&apos;emploi</div>
      </div>

      <div className="flex flex-col items-center pt-6 pb-2 text-center md:pt-8">
        <EtatVideIllustration icone="waving_hand" />
        <h1 className="mb-1.5 text-xl font-medium md:text-2xl">Comment on s&apos;organise avec Kikela</h1>
        <p className="max-w-md text-[15px] leading-relaxed text-on-surface-variant">
          Deux minutes de lecture pour comprendre à quoi sert l&apos;appli et comment le foyer l&apos;utilise.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-xl md:mt-10">
        <Section icone="holiday_village" titre="À quoi sert Kikela">
          <p>
            Kikela, c&apos;est le planning partagé des maisons de vacances de la famille : Bolquère, Gèdre et
            Saint-Gilles-Croix-de-Vie. Chaque foyer peut voir qui prévoit d&apos;aller où et quand, poser ses envies
            de séjour, et réserver. L&apos;objectif est simple : que tout le monde ait la même vue, au même endroit,
            sans avoir à se relancer des messages pour savoir qui va où.
          </p>
        </Section>

        <Section icone="checklist" titre="Souhait puis confirmation">
          <p className="mb-3">
            Une réservation se fait en deux temps. D&apos;abord un <b>souhait</b> : tu indiques les dates qui
            t&apos;intéressent, il apparaît en pointillés sur le planning et reste visible par tous, mais n&apos;est
            pas encore acquis. Ensuite, quand tu es sûr de toi, tu <b>confirmes</b> : la réservation passe en plein
            sur le planning.
          </p>
          <p>Un empêchement, un changement de plan ? Tu retires ton souhait ou annules ta réservation en un clic.</p>
        </Section>

        <Section icone="groups" titre="Pas de validation, pas de hiérarchie">
          <p>
            Kikela n&apos;est pas un outil de réservation avec circuit de validation. C&apos;est plus proche
            d&apos;une feuille partagée : chacun indique ses envies et ses réservations en toute confiance, sans
            contrôle ni arbitrage automatique. Personne ne valide à ta place, et l&apos;appli ne bloque pas les
            chevauchements de dates. C&apos;est un choix assumé : on préfère un outil simple et rapide à un outil
            qui gère tout à ta place.
          </p>
        </Section>

        <div className="mb-7 flex gap-2.5 rounded-2xl bg-warning-container px-4 py-3.5 text-[14px] leading-relaxed text-warning-on-container">
          <Icon name="info" size={18} className="mt-0.5 flex-none" />
          <p>
            En cas de doute ou de dates qui se chevauchent, le plus simple reste de s&apos;appeler ou de
            s&apos;écrire directement. Un groupe WhatsApp familial existe pour ça : poser une question, signaler un
            conflit de dates, partager un bon plan sur un lieu, ou proposer une amélioration pour Kikela.
          </p>
        </div>

        <Section icone="build_circle" titre="Les limites, aujourd&apos;hui">
          <p>
            Kikela est encore jeune et pensé pour rester simple avant tout : pas de notifications automatiques, pas
            de compte individuel (on se connecte par foyer), pas de gestion fine des conflits de dates. Selon ce
            qui remonte de l&apos;usage au fil des séjours, l&apos;appli pourra s&apos;enrichir avec le temps. Pour
            l&apos;instant, on privilégie la simplicité à l&apos;exhaustivité.
          </p>
        </Section>
      </div>
    </div>
  );
}
