import { redirect } from "next/navigation";
import { getGoogleAuthUrl } from "@/lib/google-auth";
import { getFoyerIdConnecte } from "@/lib/session";

export async function GET() {
  const foyerId = await getFoyerIdConnecte();
  if (!foyerId) redirect("/qui-es-tu");

  redirect(getGoogleAuthUrl());
}
