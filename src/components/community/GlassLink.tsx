"use client";
import React from "react";
import { IconType } from "react-icons";

interface GlassLinkProps {
  href: string;
  title: string;
  Icon: IconType;
  accent?: string; // icon color influence (ambient reflection)
  size?: number; // button size in px
  tint?: string; // tint color for the glass (accepts any CSS color e.g. rgba or hex)
onClick?: React.MouseEventHandler<HTMLAnchorElement>; 
children?: React.ReactNode;
}

export default function GlassLink({
  href,
  title,
  Icon,
  accent = "#30db5b", // Apple-green by default
  size = 44,
  tint = "rgba(11,11,11,0.18)", // subtle dark tint by default
  onClick,
    children,
}: GlassLinkProps) {
  return (
    <a
      href={href}
      title={title}
      onClick={onClick}
      className="
        group relative inline-flex items-center justify-center
        rounded-2xl overflow-hidden
        transition-transform duration-200
        hover:scale-[1.04] active:scale-100
        shadow-[0_6px_18px_rgba(0,0,0,0.45)]
      "
      style={{
        width: size,
        height: size,
        // frost
        backdropFilter: "blur(8px) saturate(1.3)",
        WebkitBackdropFilter: "blur(8px) saturate(1.3)",
        // two-layer background: sheen + tinted base (tint controlled by --tint)
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), " +
          "linear-gradient(180deg, var(--tint), rgba(255,255,255,0.015))",
        border: "1px solid rgba(255,255,255,0.08)",
        // pass color vars to CSS via variables
        ["--accent" as any]: accent,
        ["--tint" as any]: tint,
      }}
    >
      {/* Icon */}
      <Icon
        className="text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]"
        size={size * 0.58}
        aria-hidden="true"
      />

      {/* Ambient reflection — stays INSIDE due to overflow-hidden */}
      <span className="absolute inset-0 pointer-events-none mix-blend-screen opacity-90">
        <span
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                circle at 60% 50%,
                var(--accent) 0%,
                rgba(48,219,91,0.25) 10%,
                rgba(48,219,91,0.08) 25%,
                rgba(48,219,91,0.03) 40%,
                transparent 60%
              )
            `,
            filter: "blur(10px)",
          }}
        />
      </span>
      {children}
    </a>
  );
}
