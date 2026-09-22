"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSectionStagger } from "@/hooks/useSectionStagger";

const QUICK_LINKS = [
  { label: "Tentang", href: "/tentang" },
  { label: "Cara Kerja", href: "/cara-kerja" },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const staggerOptions = useMemo(
    () => ({
      triggerStart: "top 90%",
      groups: [
        {
          selector: ".footer-col",
          fromVars: { opacity: 0, y: 30 },
          toVars: { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          position: "<",
        },
        {
          selector: ".footer-bottom",
          fromVars: { opacity: 0, y: 10 },
          toVars: { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
          position: "-=0.1",
        },
      ],
    }),
    [],
  );

  const footerRef = useSectionStagger(staggerOptions);

  return (
    <footer ref={footerRef} className="w-full border-t border-gray-100 bg-white">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 py-16 sm:py-20 md:grid-cols-2 md:gap-10">
        <div className="footer-col flex flex-col gap-4 opacity-0">
          <span className="font-heading text-xl font-semibold text-black">
            Loopera
          </span>
          <p className="font-sans text-sm leading-relaxed text-black/70">
            Platform digital untuk mencatat, menukar, dan memantau sampah daur
            ulang demi lingkungan yang lebih bersih.
          </p>
        </div>

        <div className="footer-col flex flex-col gap-4 opacity-0">
          <span className="font-heading text-lg font-semibold text-black">
            Tautan
          </span>
          <nav className="flex flex-col gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-sm text-black/70 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="footer-bottom border-t border-gray-100 opacity-0">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <p className="text-center font-sans text-xs text-black/50">
            {currentYear} Loopera. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
