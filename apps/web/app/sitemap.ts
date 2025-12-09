import type { MetadataRoute } from "next";
import { env } from "@/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL || "https://angri.nl";
  const lastModified = new Date();

  const routes = [
    "",
    "/login",
    "/pricing",
    "/enterprise",
    "/founders",
    "/small-business",
    "/creator",
    "/real-estate",
    "/support",
    "/ecommerce",
    "/security",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));
}
