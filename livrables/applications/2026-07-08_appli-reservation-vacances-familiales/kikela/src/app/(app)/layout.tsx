import { AppShell } from "@/components/AppShell";
import { getFoyerConnecte } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const foyerConnecte = await getFoyerConnecte();

  return <AppShell foyerConnecte={foyerConnecte}>{children}</AppShell>;
}
