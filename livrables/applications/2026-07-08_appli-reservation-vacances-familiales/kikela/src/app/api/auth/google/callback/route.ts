import { NextRequest, NextResponse } from "next/server";
import { connectGoogleAccount } from "@/lib/google-auth";
import { getFoyerIdConnecte } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const foyerId = await getFoyerIdConnecte();
  if (!foyerId) {
    return NextResponse.redirect(`${origin}/qui-es-tu`);
  }

  if (error) {
    return NextResponse.redirect(`${origin}/login?erreur=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/login?erreur=code_manquant`);
  }

  try {
    await connectGoogleAccount(code);
  } catch (err) {
    console.error("Échec de la connexion Google :", err);
    return NextResponse.redirect(`${origin}/login?erreur=echec_connexion`);
  }

  return NextResponse.redirect(`${origin}/login?connecte=1`);
}
