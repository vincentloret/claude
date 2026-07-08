import { getLieux } from "@/lib/queries";
import { LoginClient } from "@/components/LoginClient";

export default async function LoginPage() {
  const lieux = await getLieux();
  return <LoginClient lieux={lieux} />;
}
