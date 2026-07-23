import Link from "next/link";
import { Icon } from "@/components/Icon";
import { EtatVideIllustration } from "@/components/EtatVideIllustration";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-container px-6 py-12 text-center">
      <EtatVideIllustration icone="travel_explore" />
      <div className="mt-4 text-2xl font-bold tracking-tight text-on-primary-container">
        Cette page est partie en vacances
      </div>
      <p className="mt-2 mb-8 max-w-xs text-sm leading-relaxed text-[#7A5A4E]">
        Elle n&apos;est pas à l&apos;adresse indiquée, et personne ne sait vraiment où elle est passée.
      </p>
      <Link
        href="/planning"
        className="flex h-12 items-center gap-2 rounded-full px-6.5 text-[15px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95"
        style={{ backgroundColor: "var(--md-primary)" }}
      >
        <Icon name="calendar_month" size={20} />
        Retour au planning
      </Link>
    </div>
  );
}
