"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { registerCustomer } from "./actions";

type ActionResult =
  | { success: true; cardId: string }
  | {
      success: false;
      error: "validation_error";
      fields: { name?: string[]; email?: string[]; marketing_consent?: string[] };
    }
  | { success: false; error: "email_exists" | "db_error" };

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    // Normalise checkbox — server action checks for the string "true"
    formData.set("marketing_consent", marketingConsent ? "true" : "false");

    startTransition(async () => {
      const res = await registerCustomer(formData);
      if (res.success) {
        router.push(`/card/${res.cardId}`);
      } else {
        setResult(res as ActionResult);
      }
    });
  }

  const fieldErrors =
    result && !result.success && result.error === "validation_error"
      ? result.fields
      : {};

  return (
    <div className="dark min-h-screen bg-[#131313] text-[#e5e2e1]">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0e0e0e] border-b border-[#e6c364]/10 shadow-[0_4px_40px_rgba(230,195,100,0.04)] flex items-center justify-center">
        <span className="font-headline font-black text-[#e6c364] uppercase tracking-widest text-sm animate-logo-breathe">
          PHI PHI LOUNGE
        </span>
      </header>

      {/* Main content */}
      <main className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md py-12">
          {/* Logo area */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#1c1b1b] rounded-xl flex items-center justify-center mb-6 animate-scale-in">
              <span
                className="material-symbols-outlined text-[#e6c364] text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_bar
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-headline font-extrabold text-4xl tracking-tighter uppercase text-center leading-none mb-3 animate-fade-in-up">
              ÚNETE AL<br />CLUB
            </h1>

            {/* Subline */}
            <p className="text-[#e6c364] text-xs uppercase tracking-widest animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              10 shishas → 1 gratis
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name field */}
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <label
                htmlFor="name"
                className="block text-[10px] uppercase tracking-widest text-[#d0c5b2]"
              >
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Ej. Julian Thorne"
                autoComplete="name"
                className="w-full bg-[#1c1b1b] border-0 px-5 py-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] text-sm text-[#e5e2e1] placeholder:text-[#99907e] transition-colors"
              />
              {fieldErrors.name && (
                <p className="text-[#ffb4ab] text-xs mt-1">
                  {fieldErrors.name[0]}
                </p>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <label
                htmlFor="email"
                className="block text-[10px] uppercase tracking-widest text-[#d0c5b2]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="julian@prestige.com"
                autoComplete="email"
                className="w-full bg-[#1c1b1b] border-0 px-5 py-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 focus:bg-[#353534] text-sm text-[#e5e2e1] placeholder:text-[#99907e] transition-colors"
              />
              {fieldErrors.email && (
                <p className="text-[#ffb4ab] text-xs mt-1">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Marketing consent */}
            <div className="flex items-start gap-3 pt-1 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <button
                type="button"
                role="checkbox"
                aria-checked={marketingConsent}
                onClick={() => setMarketingConsent((v) => !v)}
                className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-colors border ${
                  marketingConsent
                    ? "bg-[#e6c364] border-[#e6c364]"
                    : "bg-transparent border-[#4d4637] hover:border-[#99907e]"
                }`}
              >
                {marketingConsent && (
                  <span className="material-symbols-outlined text-[#3d2e00] text-sm leading-none">
                    check
                  </span>
                )}
              </button>
              <p className="text-[11px] text-[#d0c5b2] leading-relaxed">
                Me gustaría recibir ofertas exclusivas y novedades de Phi Phi Lounge.{" "}
                <span className="text-[#99907e]">(Opcional)</span>
              </p>
            </div>

            {/* Global errors */}
            {result && !result.success && result.error === "email_exists" && (
              <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 rounded-xl px-5 py-4">
                <p className="text-[#ffb4ab] text-sm">
                  Este email ya está registrado. Visita el local para recuperar tu tarjeta.
                </p>
              </div>
            )}
            {result && !result.success && result.error === "db_error" && (
              <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 rounded-xl px-5 py-4">
                <p className="text-[#ffb4ab] text-sm">
                  Algo ha ido mal. Por favor, inténtalo de nuevo.
                </p>
              </div>
            )}

            {/* CTA */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#e6c364] text-[#3d2e00] font-headline font-bold uppercase tracking-widest py-5 rounded-md transition-opacity disabled:opacity-60 mt-2 btn-press animate-fade-in-up"
              style={{ animationDelay: '0.45s' }}
            >
              {isPending ? "Un momento…" : "Obtener mi tarjeta"}
            </button>
          </form>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <span className="material-symbols-outlined text-[#99907e] text-base">
              verified_user
            </span>
            <p className="text-[10px] uppercase tracking-widest text-[#99907e]">
              Tus datos son privados y nunca se comparten
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
