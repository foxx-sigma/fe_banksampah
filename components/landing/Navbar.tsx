"use client";

import { useEffect, useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import gsap from "gsap";

const NAV_ITEMS = [
  { label: "Beranda", href: "#beranda" },
  { label: "Tentang", href: "#tentang" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Kontak", href: "#kontak" },
] as const;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    gsap.set(nav, { opacity: 0, y: -20 });

    const play = () => {
      gsap.to(nav, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    window.addEventListener("landing-ready", play, { once: true });

    const fallback = setTimeout(() => {
      if (gsap.getProperty(nav, "opacity") === 0) play();
    }, 6000);

    return () => {
      window.removeEventListener("landing-ready", play);
      clearTimeout(fallback);
    };
  }, []);

  function handleNavClick() {
    setMobileOpen(false);
  }

  return (
    <nav ref={navRef} className="relative w-full px-4 pt-4 opacity-0 sm:px-6 sm:pt-6">
      <div className="mx-auto max-w-6xl rounded-full border border-gray-200 bg-white/90 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <a
            href="#beranda"
            onClick={handleNavClick}
            className="font-heading text-xl font-semibold text-black"
          >
            Bank Sampah
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-1.5 font-sans text-sm font-medium text-black/70 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <a
              href="#daftar"
              className="rounded-full bg-primary px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
            >
              Daftar Sekarang
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex items-center justify-center rounded-full p-2 text-black/70 transition-colors hover:bg-primary/10 hover:text-primary md:hidden"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-gray-200 bg-white/95 px-4 py-4 shadow-sm md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className="rounded-xl px-4 py-2.5 font-sans text-sm font-medium text-black/70 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 border-t border-gray-100 pt-3">
              <a
                href="#daftar"
                onClick={handleNavClick}
                className="block rounded-full bg-primary px-5 py-2.5 text-center font-sans text-sm font-semibold text-white transition hover:opacity-90"
              >
                Daftar Sekarang
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
