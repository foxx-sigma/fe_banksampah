"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useSectionStagger } from "@/hooks/useSectionStagger";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormStatus = "idle" | "loading" | "success" | "error";

export default function ContactSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  const staggerOptions = useMemo(
    () => ({
      triggerStart: "top 85%",
      groups: [
        {
          selector: ".contact-content",
          fromVars: { opacity: 0, y: 30 },
          toVars: { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          position: "<",
        },
      ],
    }),
    [],
  );

  const sectionRef = useSectionStagger(staggerOptions);

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
    <section
      ref={sectionRef}
      id="kontak"
      className="w-full border-t border-gray-100 bg-white px-6 py-16 sm:py-20"
    >
      <div className="contact-content mx-auto flex max-w-2xl flex-col items-center gap-4 text-center opacity-0">
        <h2 className="font-heading text-2xl font-bold text-black sm:text-3xl md:text-4xl">
          Dapatkan Informasi Daur Ulang
        </h2>
        <p className="max-w-lg font-sans text-sm leading-relaxed text-black/70 sm:text-base">
          Masukkan email untuk mendapatkan informasi terbaru seputar daur ulang
          dan pengelolaan sampah.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex w-full max-w-md flex-col gap-3"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="contact-email" className="sr-only">
              Alamat email
            </label>
            <input
              id="contact-email"
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
              className="rounded-full bg-primary px-6 py-2.5 font-sans text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
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
    </section>
  );
}
