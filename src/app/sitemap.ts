import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/gold-rate-shikrapur/`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/elite-plan/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/privacy/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/terms/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}
