import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permet de lancer un second serveur (tests automatiques) sans gêner celui du développement.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
