"use client";

import React, { useMemo, useState } from "react";

/**
 * Drop this component into a Next.js page (e.g. app/release-notes/page.tsx).
 * Requires Tailwind CSS in the project.
 */

type Note = {
  id: string;        // unique id for anchor links
  date: string;      // human readable date (display)
  title?: string;    // optional title for the release
  highlights?: string[]; // short highlights shown on TOC (optional)
  changes: string[]; // list of bullets describing changes
};

const SAMPLE_NOTES: Note[] = [
  {
    id: "2025-10-15",
    date: "October 15, 2025",
    title: "Forum Comments Feature",
    highlights: ["Comment system", "Easier discussions"],
    changes: [
      "Introduced a brand-new **comment feature** for forums — making discussions smoother, more interactive, and easier to follow.",
      "Improved thread layout for better readability and engagement."
    ],
  },
  {
    id: "2025-10-25",
    date: "October 25, 2025",
    title: "Pomodoro & Study Improvements",
    highlights: ["Streak visualization", "Dark mode for sessions", "Mini message panel"],
    changes: [
      "Added Pomodoro streak visualization with weekly insights on the dashboard.",
      "New study-session dark mode toggle.",
      "Introduced a **mini message panel** inside Pomodoro mode for quick peer communication.",
      "Fixed multiple bugs and improved session stability.",
      "Performance improvements to sync and caching for offline sessions."
    ],
  },
  {
    id: "2025-10-29",
    date: "October 29, 2025",
    title: "Platform & Security",
    highlights: ["UI refresh", "Firebase upgrade"],
    changes: [
      "Major dashboard UI refresh to match the new ExamConnect style.",
      "Upgraded authentication flow for faster sign-in (Firebase v10).",
      "Security hardening and updated data retention prompts."
    ],
  },

  {
    id: "2025-11-04",
    date: "November 4, 2025",
    title: "🚀 STUDY GROUPS LAUNCHED!",
    highlights: ["Study together", "Live collaboration", "Group challenges"],
    changes: [
      "We’re thrilled to introduce **Study Groups** — a whole new way to learn and stay accountable together!",
      "Create or join study groups, share progress, and participate in **real-time group challenges**.",
      "Includes in-app voice rooms and live collaboration boards for teamwork.",
      "More group management tools and performance insights coming soon!"
    ],
  },
];


export default function ReleaseNotes() {
  const [query, setQuery] = useState("");
  const [onlyTitles, setOnlyTitles] = useState(false);

  // normalize text for search
  const norm = (s: string) => s.toLowerCase();

  // Filtered notes
  const filtered = useMemo(() => {
    if (!query.trim()) return SAMPLE_NOTES;
    const q = norm(query);
    return SAMPLE_NOTES.filter((note) => {
      if (!onlyTitles) {
        // match date, title, highlights, and change text
        if (norm(note.date).includes(q)) return true;
        if (note.title && norm(note.title).includes(q)) return true;
        if (note.highlights && note.highlights.some(h => norm(h).includes(q))) return true;
        if (note.changes.some(c => norm(c).includes(q))) return true;
      } else {
        // match only title/date
        if (norm(note.date).includes(q)) return true;
        if (note.title && norm(note.title).includes(q)) return true;
      }
      return false;
    });
  }, [query, onlyTitles]);

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Top header */}
      <header className="border-b px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">ExamConnect — Release Notes</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            A changelog of the latest updates, improvements, and fixes for ExamConnect. Use the search to find anything quickly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* white search box */}
          <label htmlFor="search" className="sr-only">Search release notes</label>
          <div className="relative w-72 md:w-96">
            <input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search updates, dates, or titles..."
              className="w-full bg-white border shadow-sm border-gray-200 rounded-lg py-2.5 pl-4 pr-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <span className="absolute right-3 top-2.5 text-sm text-gray-500 select-none">⌘K</span>
          </div>

          
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-10">
        {/* Content column */}
        <section>
          <div className="space-y-8">
            {filtered.length === 0 && (
              <div className="rounded border border-dashed border-gray-200 p-6 text-gray-600">
                No matching updates for <strong className="text-gray-800">{query}</strong>. Try different keywords.
              </div>
            )}

            {filtered.map((note) => (
              <article key={note.id} id={note.id} className="pt-2 scroll-mt-24">
                <header className="mb-3">
                  <p className="text-sm text-gray-500">{note.title ?? "Release"}</p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">{note.date}</h2>
                </header>

                {/* optional subtitle */}
                {note.highlights && note.highlights.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {note.highlights.map((h, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 border border-gray-100 text-gray-700">
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                <ul className="list-disc ml-5 space-y-2 text-gray-700">
                  {note.changes.map((c, i) => (
                    <li key={i} className="leading-relaxed">{c}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

 {/* Right: TOC */}
        <aside className="hidden md:block">
          <div className="sticky top-20">
            <div className="rounded-lg border p-5 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">All Releases</h3>

              <nav aria-label="Release notes table of contents" className="max-h-[60vh] overflow-auto pr-2">
                <ul className="space-y-3 text-sm">
                  {SAMPLE_NOTES.map((n) => (
                    <li key={n.id}>
                      <a
                        href={`#${n.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(n.id);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="block rounded px-2 py-1 transition-colors duration-180 ease-in-out"
                        // Visual effect: text transitions from lighter -> darker on hover (no blue)
                        style={{ color: "rgb(83 93 105)" }}
                        // We'll apply tailwind classes for hover transition
                      >
                        <div className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-180">
                          <span className="block text-gray-700 hover:text-gray-900 transition-colors duration-180">{n.date}</span>
                        </div>

                        {/* indented short list similar to screenshot */}
                        <ul className="mt-2 ml-3 space-y-1">
                          {n.changes.map((c, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-500 hover:text-gray-800 transition-colors duration-180"
                            >
                              {c}
                            </li>
                          ))}
                        </ul>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              
              <div className="mt-6 text-xs text-gray-500">
                Last updated: <strong className="text-gray-700">November 3, 2025</strong>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
