import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aldım - Fatura, Garanti, İade Takip",
    short_name: "Aldım",
    description:
      "Aldıkların kontrol altında. Faturanı, garanti süreni, iade hakkını ve servis kayıtlarını tek yerden takip et.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8FAFC",
    theme_color: "#172F5E",
    lang: "tr",
    categories: ["productivity", "lifestyle", "finance"],
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
