"use client";

import { useState, useRef, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/ui/PasswordInput";

type RoleTab = "nasabah" | "admin";

export default function RegisterPage() {
  const router = useRouter();
  const { registerNasabah, registerAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<RoleTab>("nasabah");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [namaNasabah, setNamaNasabah] = useState("");
  const [alamat, setAlamat] = useState("");
  const [telpNasabah, setTelpNasabah] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [namaUnit, setNamaUnit] = useState("");
  const [namaPengelola, setNamaPengelola] = useState("");
  const [telpAdmin, setTelpAdmin] = useState("");

  function switchTab(tab: RoleTab) {
    setActiveTab(tab);
    setError("");
    setSuccess("");
  }

  async function handleNasabahSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const foto = fileInputRef.current?.files?.[0];
      await registerNasabah({
        username: username.trim(),
        password,
        namaNasabah: namaNasabah.trim(),
        alamat: alamat.trim(),
        telp: telpNasabah.trim(),
        foto,
      });
      setSuccess("Registrasi nasabah berhasil. Silakan login.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat registrasi",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await registerAdmin({
        username: adminUsername.trim(),
        password: adminPassword,
        namaUnit: namaUnit.trim(),
        namaPengelola: namaPengelola.trim(),
        telp: telpAdmin.trim(),
      });
      setSuccess("Registrasi admin berhasil. Silakan login.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat registrasi",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm relative">
        <button
          onClick={() => router.back()}
          className="absolute left-6 top-6 p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>

        <h1 className="font-heading text-2xl font-bold text-center mb-2 mt-4">
          Daftar Akun
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Buat akun baru di Bank Sampah Digital
        </p>

        <div className="mb-6 flex rounded-lg border border-gray-200 p-1">
          <button
            type="button"
            onClick={() => switchTab("nasabah")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              activeTab === "nasabah"
                ? "bg-primary text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Nasabah
          </button>
          <button
            type="button"
            onClick={() => switchTab("admin")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              activeTab === "admin"
                ? "bg-primary text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Admin Bank
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {activeTab === "nasabah" ? (
          <form onSubmit={handleNasabahSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="nas-username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="nas-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="nas-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <PasswordInput
                id="nas-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="nas-nama" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                id="nas-nama"
                type="text"
                required
                value={namaNasabah}
                onChange={(e) => setNamaNasabah(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="nas-alamat" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <input
                id="nas-alamat"
                type="text"
                required
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Masukkan alamat"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="nas-telp" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                id="nas-telp"
                type="text"
                required
                value={telpNasabah}
                onChange={(e) => setTelpNasabah(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="nas-foto" className="block text-sm font-medium text-gray-700 mb-1">
                Foto Profil (opsional)
              </label>
              <input
                id="nas-foto"
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Daftar sebagai Nasabah"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="adm-username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="adm-username"
                type="text"
                required
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="adm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <PasswordInput
                id="adm-password"
                required
                minLength={6}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="adm-unit" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Unit Bank Sampah
              </label>
              <input
                id="adm-unit"
                type="text"
                required
                value={namaUnit}
                onChange={(e) => setNamaUnit(e.target.value)}
                placeholder="Masukkan nama unit"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="adm-pengelola" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pengelola
              </label>
              <input
                id="adm-pengelola"
                type="text"
                required
                value={namaPengelola}
                onChange={(e) => setNamaPengelola(e.target.value)}
                placeholder="Masukkan nama pengelola"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="adm-telp" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                id="adm-telp"
                type="text"
                required
                value={telpAdmin}
                onChange={(e) => setTelpAdmin(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Daftar sebagai Admin Bank"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
