import { NextRequest, NextResponse } from "next/server";
import { connectGoogleAccount } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

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
