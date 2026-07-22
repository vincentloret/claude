import { redirect } from "next/navigation";
import { getGoogleAuthUrl } from "@/lib/google-auth";

export async function GET() {
  redirect(getGoogleAuthUrl());
}
