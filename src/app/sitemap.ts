// src/app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://examconnect.vercel.app"; // replace with your real domain

  // Define custom SEO settings per route
  const routes: Record<
    string,
    { priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }
  > = {
    "": { priority: 1.0, changeFrequency: "daily" }, // homepage
    "/about": { priority: 0.6, changeFrequency: "yearly" },
    "/accountsetting": { priority: 0.6, changeFrequency: "yearly" },
    "/community": { priority: 0.9, changeFrequency: "daily" },
    "/contact": { priority: 0.5, changeFrequency: "yearly" },
    "/content-policy": { priority: 0.5, changeFrequency: "yearly" },
    "/cookie-ppolicy": { priority: 0.5, changeFrequency: "yearly" },
    // "/dashboard": { priority: 0.8, changeFrequency: "weekly" },
    "/login": { priority: 0.3, changeFrequency: "yearly" },
    "/message": { priority: 0.7, changeFrequency: "daily" },
    "/post": { priority: 0.9, changeFrequency: "daily" },
    // "/premium": { priority: 0.8, changeFrequency: "monthly" },
    "/privacy-policy": { priority: 0.4, changeFrequency: "yearly" },
    "/profile": { priority: 0.6, changeFrequency: "monthly" },
    // "/settings": { priority: 0.5, changeFrequency: "monthly" },
    "/signup": { priority: 0.4, changeFrequency: "yearly" },
    "/sleep": { priority: 0.7, changeFrequency: "weekly" },
    "/task": { priority: 0.8, changeFrequency: "daily" },
    "/terms-and-conditions": { priority: 0.4, changeFrequency: "yearly" },
    "/user-agreement": { priority: 0.4, changeFrequency: "yearly" },
  };

  return Object.entries(routes).map(([path, config]) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: config.changeFrequency,
    priority: config.priority,
  }));
}
