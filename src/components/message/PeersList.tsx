"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Loader } from "lucide-react";
import useActivePeers from "@/hooks/useActivePeers";
import { useChatStore } from "@/store/useChatStore";

function colorForKey(key: string) {
  const palette = [
    "bg-rose-500","bg-orange-500","bg-amber-500","bg-lime-500","bg-emerald-500",
    "bg-teal-500","bg-sky-500","bg-indigo-500","bg-violet-500","bg-fuchsia-500",
  ];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
  const idx = Math.abs(hash) % palette.length;
  return palette[idx];
}

function initialOf(name?: string) {
  const n = (name || "?").trim();
  return n ? n.charAt(0).toUpperCase() : "?";
}

export default function PeersList() {
  const [query, setQuery] = useState("");
  const { peers, loading, error } = useActivePeers();
  const { setSelectedUser } = useChatStore();

  const filtered = useMemo(() => {
    return peers.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.username && p.username.toLowerCase().includes(query.toLowerCase()))
    );
  }, [peers, query]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <motion.div
        className="flex items-center gap-3 px-1 rounded-2xl p-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search peers..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 text-zinc-100 placeholder-zinc-400"
          />
        </div>
      </motion.div>

      {/* Peers section */}
      <div>
        <h3 className="text-[11px] tracking-wide font-medium text-zinc-400 uppercase mb-2 px-1">
          Online in last 24h
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader size={24} className="animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-400 text-xs">{error}</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((peer, idx) => {
              const bg = colorForKey(peer.id);
              const initial = initialOf(peer.name);
              const hasImage = Boolean(peer.avatar);

              return (
                <motion.button
                  key={peer.id}
                  onClick={() =>
                    setSelectedUser({
                      uid: peer.id,
                      username: peer.username || peer.name,
                      fullName: peer.name,
                      profilePic: peer.avatar || "",
                    })
                  }
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  className="w-full relative flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/5"
                >
                  <div className="relative shrink-0">
                    {hasImage ? (
                      <img
                        src={peer.avatar}
                        alt={peer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white font-semibold`}>
                        {initial}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 bg-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-white text-sm">{peer.name}</p>
                      <span className="text-[11px] text-zinc-400">{peer.countryFlag}</span>
                    </div>
                    <p className="text-[12px] text-zinc-400">
                      {peer.age ? `${peer.age} years old` : "Age unknown"}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-zinc-400 text-xs">No peers online in the last 24 hours.</div>
        )}
      </div>
    </div>
  );
}
