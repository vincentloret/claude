import { AppShell } from "@/components/AppShell";
import { getMembreConnecte } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const membre = await getMembreConnecte();
  return <AppShell membre={membre}>{children}</AppShell>;
}
