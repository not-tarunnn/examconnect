// src/app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://examconnect.co.in"; // replace with your real domain

  // Define custom SEO settings per route
  const routes: Record<
    string,
    { priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }
  > = {
    "": { priority: 1.0, changeFrequency: "daily" }, // homepage
    "/about": { priority: 0.6, changeFrequency: "yearly" },
    "/accountsetting": { priority: 0.6, changeFrequency: "yearly" },
    "/c": { priority: 0.5, changeFrequency: "daily" },
    "/community": { priority: 0.9, changeFrequency: "daily" },
    "/contact": { priority: 0.5, changeFrequency: "yearly" },
    "/content-policy": { priority: 0.5, changeFrequency: "yearly" },
    "/cookie-policy": { priority: 0.5, changeFrequency: "yearly" },
    "/dashboard": { priority: 0.8, changeFrequency: "weekly" },
    "/group": { priority: 0.3, changeFrequency: "daily" },
    "/leaderboard": { priority: 0.8, changeFrequency: "daily" },
    "/login": { priority: 0.3, changeFrequency: "yearly" },
    "/message": { priority: 0.9, changeFrequency: "daily" },
    "/post": { priority: 0.9, changeFrequency: "daily" },
    "/premium": { priority: 0.8, changeFrequency: "monthly" },
    "/privacy-policy": { priority: 0.4, changeFrequency: "yearly" },
    "/profile": { priority: 0.6, changeFrequency: "monthly" },
    "/release-notes": { priority: 0.3, changeFrequency: "daily" },
    "/settings": { priority: 0.5, changeFrequency: "monthly" },
    "/signup": { priority: 0.4, changeFrequency: "yearly" },
    "/sleep": { priority: 0.8, changeFrequency: "daily" },
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
