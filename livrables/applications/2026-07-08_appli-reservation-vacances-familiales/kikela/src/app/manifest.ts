import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kikela, les vacances en famille",
    short_name: "Kikela",
    description: "Les vacances en famille, sans prise de tête.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f6",
    theme_color: "#a5492a",
    lang: "fr",
    icons: [
      { src: "/icons/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
