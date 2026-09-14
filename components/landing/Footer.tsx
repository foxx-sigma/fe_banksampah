"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useSectionStagger } from "@/hooks/useSectionStagger";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const QUICK_LINKS = [
  { label: "Tentang", href: "#tentang" },
  { label: "Cara Kerja", href: "#cara-kerja" },
] as const;

type FormStatus = "idle" | "loading" | "success" | "error";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
      setStatus("error");
      setMessage("Format email tidak valid. Silakan periksa kembali.");
      return;
    }

    setStatus("loading");
    setMessage("");

    setTimeout(() => {
      setStatus("success");
      setMessage("Terima kasih! Email kamu berhasil didaftarkan.");
      setEmail("");
    }, 600);
  }

  return (
    <footer ref={footerRef} id="kontak" className="w-full border-t border-gray-100 bg-white">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 py-16 sm:py-20 md:grid-cols-3 md:gap-10">
        <div className="footer-col flex flex-col gap-4 opacity-0">
          <span className="font-heading text-xl font-semibold text-black">
            Bank Sampah Digital
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
              <a
                key={link.href}
                href={link.href}
                className="font-sans text-sm text-black/70 transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="footer-col flex flex-col gap-4 opacity-0">
          <span className="font-heading text-lg font-semibold text-black">
            Dapatkan Informasi Daur Ulang
          </span>
          <p className="font-sans text-sm text-black/70">
            Masukkan email untuk mendapatkan informasi terbaru seputar daur ulang
            dan pengelolaan sampah.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="footer-email" className="sr-only">
                Alamat email
              </label>
              <input
                id="footer-email"
                type="email"
                required
                placeholder="emailkamu@contoh.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle" && status !== "loading") {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                disabled={status === "loading"}
                className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-black placeholder:text-black/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-full bg-primary px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {status === "loading" ? "Mengirim..." : "Kirim"}
              </button>
            </div>

            {message && (
              <p
                role="status"
                aria-live="polite"
                className={`font-sans text-xs ${
                  status === "success" ? "text-primary" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="footer-bottom border-t border-gray-100 opacity-0">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <p className="text-center font-sans text-xs text-black/50">
            {currentYear} Bank Sampah Digital. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
