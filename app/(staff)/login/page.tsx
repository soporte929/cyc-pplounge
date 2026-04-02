"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInWithPassword } from "./actions";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signInWithPassword(formData);

      if (result.success) {
        router.push("/scan");
      } else if (result.error === "validation_error") {
        const fields = result.fields;
        if (fields?.email) setError(fields.email[0]);
        else if (fields?.password) setError(fields.password[0]);
      } else {
        setError("Email o contraseña incorrectos");
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full flex justify-center items-center px-6 h-16 bg-[#0e0e0e] border-b border-[#e6c364]/10 shadow-[0_4px_40px_rgba(230,195,100,0.04)] z-50">
        <span className="text-[#e6c364] font-black tracking-widest text-lg uppercase font-headline">
          PHI PHI LOUNGE
        </span>
      </header>

      {/* Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-8 pt-24 pb-12">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="mb-12 flex justify-start">
            <div className="w-16 h-16 bg-[#1c1b1b] flex items-center justify-center rounded-xl border border-[#4d4637]/15">
              <span
                className="material-symbols-outlined text-[#e6c364] text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_bar
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h1 className="font-headline font-extrabold text-4xl tracking-tighter text-[#e5e2e1] mb-2 uppercase">
              PORTAL STAFF
            </h1>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-[#e6c364] font-bold">
              Acceso personal autorizado
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="font-label text-[10px] uppercase tracking-widest text-[#d0c5b2] ml-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="staff@phiphilounge.com"
                required
                className="w-full bg-[#1c1b1b] border-0 text-[#e5e2e1] placeholder:text-[#4d4637]/50 px-5 py-4 rounded-xl focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all duration-300 font-body text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="font-label text-[10px] uppercase tracking-widest text-[#d0c5b2] ml-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#1c1b1b] border-0 text-[#e5e2e1] placeholder:text-[#4d4637]/50 px-5 py-4 rounded-xl focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] transition-all duration-300 font-body text-sm"
              />
            </div>

            {error && (
              <div className="bg-[#93000a]/20 border border-[#ffb4ab]/20 rounded-lg px-4 py-3">
                <p className="text-[#ffb4ab] text-sm">{error}</p>
              </div>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#e6c364] text-[#3d2e00] font-headline font-bold uppercase tracking-widest py-5 rounded-md hover:brightness-110 active:scale-[0.98] transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Accediendo..." : "Entrar"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-16 border-t border-[#4d4637]/10 pt-8">
            <div className="flex items-center gap-4 text-[#d0c5b2]">
              <div className="flex-shrink-0 w-10 h-10 rounded-full border border-[#4d4637]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">lock</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-60 font-body">
                Solo personal autorizado.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
