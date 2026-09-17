"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { List, X, SignOut } from "@phosphor-icons/react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/tentang" },
  { label: "Cara Kerja", href: "/cara-kerja" },
] as const;

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
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
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3">
        <div className="w-full flex-1 rounded-full border border-gray-200 bg-white/90 px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={handleNavClick}
              className="font-heading text-xl font-semibold text-black"
            >
              Bank Sampah
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3.5 py-1.5 font-sans text-sm font-medium text-black/70 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex md:items-center md:gap-3">
              {isAuthenticated ? (
                <Link
                  href={user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/nasabah"}
                  className="rounded-full bg-primary/10 px-5 py-2.5 font-sans text-sm font-semibold text-primary transition hover:bg-primary/20"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-full px-5 py-2.5 font-sans text-sm font-semibold text-black transition hover:opacity-70"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-primary px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Daftar Sekarang
                  </Link>
                </>
              )}
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

        {isAuthenticated && (
          <button
            type="button"
            onClick={logout}
            aria-label="Keluar"
            title="Keluar"
            className="hidden md:flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-600 hover:scale-105 active:scale-95"
          >
            <SignOut size={20} weight="bold" />
          </button>
        )}
      </div>

      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-gray-200 bg-white/95 px-4 py-4 shadow-sm md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className="rounded-xl px-4 py-2.5 font-sans text-sm font-medium text-black/70 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-gray-100 pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/nasabah"}
                    onClick={handleNavClick}
                    className="flex-1 rounded-full bg-primary/10 px-5 py-2.5 text-center font-sans text-sm font-semibold text-primary transition hover:bg-primary/20"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick();
                      logout();
                    }}
                    aria-label="Keluar"
                    title="Keluar"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                  >
                    <SignOut size={20} weight="bold" />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={handleNavClick}
                    className="block rounded-full px-5 py-2.5 text-center font-sans text-sm font-semibold text-black transition hover:opacity-70"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={handleNavClick}
                    className="block rounded-full bg-primary px-5 py-2.5 text-center font-sans text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Daftar Sekarang
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
