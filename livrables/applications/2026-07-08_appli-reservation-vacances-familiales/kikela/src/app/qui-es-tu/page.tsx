import { redirect } from "next/navigation";
import { getFoyers } from "@/lib/queries";
import { getFoyerIdConnecte } from "@/lib/session";
import { choisirFoyer } from "@/lib/actions";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";

export default async function QuiEsTuPage() {
  let foyerId: string | null;
  let foyers: Awaited<ReturnType<typeof getFoyers>>;
  try {
    foyerId = await getFoyerIdConnecte();
    if (foyerId) redirect("/planning");
    foyers = await getFoyers();
  } catch (e) {
    const err = e as Error & { digest?: string };
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    return (
      <pre style={{ whiteSpace: "pre-wrap", padding: 20, fontSize: 12 }}>
        DEBUG {err?.name}: {err?.message}
        {"\n"}
        {err?.stack}
      </pre>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-container px-6 py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--md-primary)" }}>
        <Icon name="holiday_village" size={30} className="text-white" />
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-on-primary-container">Kikela</div>
      <div className="mt-1 mb-8 text-center text-base text-[#7A5A4E]">Qui es-tu ?</div>

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {foyers.map((foyer) => (
          <form key={foyer.id} action={choisirFoyer}>
            <input type="hidden" name="foyerId" value={foyer.id} />
            <button
              type="submit"
              className="flex w-full flex-col items-center gap-2 rounded-2xl bg-white px-4 py-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <Avatar foyer={foyer} size={44} />
              <span className="text-center text-sm font-medium">{foyer.nom}</span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
