import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kikimange",
    short_name: "Kikimange",
    description: "Qui vient manger à la maison, à quel repas, avec qui.",
    start_url: "/semaine",
    display: "standalone",
    background_color: "#f8faf0",
    theme_color: "#436833",
    lang: "fr",
    icons: [
      { src: "/icons/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
