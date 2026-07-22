import { getLieux } from "@/lib/queries";
import { LoginClient } from "@/components/LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ connecte?: string; erreur?: string }>;
}) {
  const [lieux, params] = await Promise.all([getLieux(), searchParams]);
  return <LoginClient lieux={lieux} connecte={params.connecte === "1"} erreur={params.erreur} />;
}
