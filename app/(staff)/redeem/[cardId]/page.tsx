"use client";

// Note: This page is a Client Component because it manages the action state
// inline. Card info is fetched via a Server Action (getCardInfo) called from
// a parent wrapper below; the actual redeem action is triggered client-side.

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { StaffNav } from "@/components/staff-nav";
import { getCardInfo } from "../../scan/actions";
import { redeemReward } from "./actions";

// ─── Types ───────────────────────────────────────────────────────────────────

type CardInfo = Awaited<ReturnType<typeof getCardInfo>>;

type RedeemResult =
  | { success: true; stamps_remaining: number; reward_redeemed: string }
  | { success: false; error: string; stamps_current?: number; stamps_required?: number };

// ─── Main page (Client Component wrapper) ─────────────────────────────────────

interface PageProps {
  params: Promise<{ cardId: string }>;
}

export default function RedeemPage({ params }: PageProps) {
  const [cardId, setCardId] = useState<string | null>(null);
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    params.then(({ cardId: id }) => {
      setCardId(id);
      getCardInfo(id).then((info) => {
        setCardInfo(info);
        setLoaded(true);
        if (!info) setLoadError(true);
      });
    });
  }, [params]);

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Page title */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-1">
              Panel Staff
            </p>
            <h1 className="font-headline font-extrabold text-4xl uppercase tracking-tighter text-[#e5e2e1]">
              CANJEAR REWARD
            </h1>
          </div>

          {/* Loading state */}
          {!loaded && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-[#e6c364]/30 border-t-[#e6c364] animate-spin" />
              <p className="text-[11px] uppercase tracking-widest text-[#d0c5b2]">
                Cargando tarjeta...
              </p>
            </div>
          )}

          {/* Card not found */}
          {loaded && loadError && (
            <ErrorState
              icon="credit_card_off"
              title="Tarjeta no encontrada"
              message="No se pudo encontrar la tarjeta. Verifica el QR e intenta de nuevo."
            />
          )}

          {/* Card inactive */}
          {loaded && cardInfo && !cardInfo.isActive && (
            <ErrorState
              icon="block"
              title="Tarjeta desactivada"
              message="Esta tarjeta está desactivada y no puede canjear recompensas."
            />
          )}

          {/* No reward configured */}
          {loaded && cardInfo && cardInfo.isActive && !cardInfo.rewardName && (
            <ErrorState
              icon="redeem"
              title="Sin recompensa activa"
              message="Esta tarjeta no tiene una recompensa configurada."
            />
          )}

          {/* Not enough stamps */}
          {loaded && cardInfo && cardInfo.isActive && cardInfo.rewardName &&
            cardInfo.stampsCurrent < cardInfo.stampsRequired && (
              <NotEnoughStamps
                customerName={cardInfo.customerName}
                stampsCurrent={cardInfo.stampsCurrent}
                stampsRequired={cardInfo.stampsRequired}
                rewardName={cardInfo.rewardName}
              />
            )}

          {/* Confirmation UI */}
          {loaded && cardInfo && cardInfo.isActive && cardInfo.rewardName &&
            cardId && cardInfo.stampsCurrent >= cardInfo.stampsRequired && (
              <RedeemConfirmation
                cardId={cardId}
                cardInfo={cardInfo}
              />
            )}
        </div>
      </main>
      <StaffNav />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0e0e0e] border-b border-[#e6c364]/10 shadow-[0_4px_40px_rgba(230,195,100,0.04)] flex items-center px-5">
      <Link
        href="/scan"
        className="flex items-center gap-1.5 text-[#d0c5b2] hover:text-[#e5e2e1] transition-colors"
        aria-label="Volver al escáner"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">
          arrow_back
        </span>
        <span className="text-[10px] uppercase tracking-widest">Escanear</span>
      </Link>
      <span className="font-headline font-black text-[#e6c364] uppercase tracking-widest text-sm absolute left-1/2 -translate-x-1/2 animate-logo-breathe">
        PHI PHI LOUNGE
      </span>
      <div className="ml-auto flex items-center gap-1.5 text-[#d0c5b2]">
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          redeem
        </span>
        <span className="text-[10px] uppercase tracking-widest">Canjear</span>
      </div>
    </header>
  );
}

function ErrorState({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-12">
      <div className="w-20 h-20 rounded-2xl bg-[#1c1b1b] border border-[#4d4637]/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#99907e] text-4xl">
          {icon}
        </span>
      </div>
      <div className="space-y-1">
        <p className="font-headline font-bold text-xl uppercase tracking-tight text-[#e5e2e1]">
          {title}
        </p>
        <p className="text-sm text-[#d0c5b2] leading-relaxed max-w-xs">{message}</p>
      </div>
      <Link
        href="/scan"
        className="mt-4 flex items-center gap-1.5 text-[#e6c364] text-[11px] uppercase tracking-[0.2em] font-semibold hover:opacity-70 transition-opacity"
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          qr_code_scanner
        </span>
        Volver al escáner
      </Link>
    </div>
  );
}

function NotEnoughStamps({
  customerName,
  stampsCurrent,
  stampsRequired,
  rewardName,
}: {
  customerName: string;
  stampsCurrent: number;
  stampsRequired: number;
  rewardName: string;
}) {
  const missing = stampsRequired - stampsCurrent;

  return (
    <div className="space-y-6">
      {/* Customer info card */}
      <div className="bg-[#1c1b1b] rounded-xl p-6 border border-[#4d4637]/20 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-0.5">Cliente</p>
          <p className="font-headline font-bold text-xl text-[#e5e2e1]">{customerName}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-0.5">Recompensa</p>
          <p className="font-body text-[#e5e2e1]">{rewardName}</p>
        </div>
        <div className="flex gap-6 pt-2 border-t border-[#4d4637]/15">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-0.5">Sellos actuales</p>
            <p className="font-headline font-bold text-2xl text-[#e5e2e1]">{stampsCurrent}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-0.5">Sellos requeridos</p>
            <p className="font-headline font-bold text-2xl text-[#e5e2e1]">{stampsRequired}</p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-[#93000a]/10 border border-[#ffb4ab]/15 rounded-xl p-5 flex gap-4 items-start">
        <span className="material-symbols-outlined text-[#ffb4ab] text-2xl flex-shrink-0 mt-0.5">
          info
        </span>
        <div>
          <p className="font-headline font-bold text-sm text-[#ffb4ab] uppercase tracking-tight mb-1">
            Sellos insuficientes
          </p>
          <p className="text-[#d0c5b2] text-sm leading-relaxed">
            Faltan <span className="text-[#ffb4ab] font-bold">{missing}</span> sellos para canjear esta recompensa.
          </p>
        </div>
      </div>

      <Link
        href="/scan"
        className="flex items-center justify-center gap-1.5 text-[#e6c364] text-[11px] uppercase tracking-[0.2em] font-semibold hover:opacity-70 transition-opacity py-2"
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          qr_code_scanner
        </span>
        Volver al escáner
      </Link>
    </div>
  );
}

function RedeemConfirmation({
  cardId,
  cardInfo,
}: {
  cardId: string;
  cardInfo: NonNullable<CardInfo>;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RedeemResult | null>(null);

  const stampsAfter = cardInfo.stampsCurrent - cardInfo.stampsRequired;

  function handleRedeem() {
    startTransition(async () => {
      const res = await redeemReward(cardId);
      if (res.success) {
        setResult({
          success: true,
          stamps_remaining: res.stamps_remaining,
          reward_redeemed: res.reward_redeemed,
        });
      } else {
        setResult({
          success: false,
          error: res.error,
          stamps_current: res.stamps_current,
          stamps_required: res.stamps_required,
        });
      }
    });
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (result?.success) {
    return (
      <div className="space-y-6">
        {/* Success card */}
        <div className="bg-[#0a1f0a] border border-green-500/20 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-green-400 text-5xl animate-bounce-in"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <div className="space-y-1">
            <p className="font-headline font-extrabold text-2xl uppercase tracking-tight text-[#e5e2e1]">
              Reward canjeado
            </p>
            <p className="text-sm text-[#d0c5b2]">{result.reward_redeemed}</p>
          </div>
          <div className="w-full bg-[#1c1b1b] rounded-xl p-4 border border-[#4d4637]/20">
            <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-1">
              Sellos restantes
            </p>
            <p className="font-headline font-black text-4xl text-[#e6c364]">
              {result.stamps_remaining}
            </p>
          </div>
        </div>

        <Link
          href="/scan"
          className="flex items-center justify-center gap-2 w-full bg-[#1c1b1b] border border-[#4d4637]/20 text-[#e6c364] font-headline font-bold uppercase tracking-widest py-4 rounded-md hover:bg-[#353534] active:scale-[0.98] transition-all duration-200 text-sm btn-press"
        >
          <span className="material-symbols-outlined text-base">qr_code_scanner</span>
          Volver al escáner
        </Link>
      </div>
    );
  }

  // ── Error state (after attempt) ────────────────────────────────────────────
  if (result && !result.success) {
    const errorMessages: Record<string, string> = {
      not_authenticated: "Sesión expirada. Por favor inicia sesión de nuevo.",
      staff_not_found: "No tienes permisos de staff para esta acción.",
      staff_inactive: "Tu cuenta de staff está desactivada.",
      insufficient_stamps: "No hay suficientes sellos para canjear.",
      card_not_found: "Tarjeta no encontrada.",
      db_error: "Error de base de datos. Intenta de nuevo.",
      validation_error: "Datos inválidos. Intenta de nuevo.",
    };
    const message = errorMessages[result.error] ?? "Error desconocido. Intenta de nuevo.";

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-[#93000a]/10 border border-[#ffb4ab]/15 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[#ffb4ab]/10 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[#ffb4ab] text-5xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              error
            </span>
          </div>
          <div className="space-y-1">
            <p className="font-headline font-bold text-xl uppercase tracking-tight text-[#ffb4ab]">
              Error al canjear
            </p>
            <p className="text-sm text-[#d0c5b2] leading-relaxed">{message}</p>
          </div>
        </div>

        <button
          onClick={() => setResult(null)}
          className="w-full bg-[#e6c364] text-[#3d2e00] font-headline font-bold uppercase tracking-widest py-5 rounded-md hover:brightness-110 active:scale-[0.98] transition-all duration-200 text-sm btn-press"
        >
          Intentar de nuevo
        </button>

        <Link
          href="/scan"
          className="flex items-center justify-center gap-1.5 text-[#e6c364] text-[11px] uppercase tracking-[0.2em] font-semibold hover:opacity-70 transition-opacity py-2"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            qr_code_scanner
          </span>
          Volver al escáner
        </Link>
      </div>
    );
  }

  // ── Confirmation UI ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Card info */}
      <div className="bg-[#1c1b1b] rounded-xl p-6 border border-[#4d4637]/20 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-0.5">Cliente</p>
          <p className="font-headline font-bold text-xl text-[#e5e2e1]">{cardInfo.customerName}</p>
        </div>

        <div className="flex gap-6 pt-3 border-t border-[#4d4637]/15">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-0.5">Sellos actuales</p>
            <p className="font-headline font-black text-3xl text-[#e6c364]">{cardInfo.stampsCurrent}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-0.5">Sellos requeridos</p>
            <p className="font-headline font-black text-3xl text-[#e5e2e1]">{cardInfo.stampsRequired}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#4d4637]/15">
          <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-0.5">Recompensa</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="material-symbols-outlined text-[#e6c364] text-base"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              redeem
            </span>
            <p className="font-body text-[#e5e2e1] font-medium">{cardInfo.rewardName}</p>
          </div>
        </div>
      </div>

      {/* After redemption preview */}
      <div className="bg-[#201f1f] rounded-xl p-5 border border-[#e6c364]/10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#e6c364]/10 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[#e6c364] text-xl">
            auto_awesome
          </span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-0.5">
            Tras el canje
          </p>
          <p className="text-[#e5e2e1] text-sm">
            Quedarán{" "}
            <span className="font-headline font-bold text-[#e6c364] text-base">
              {stampsAfter}
            </span>{" "}
            sellos restantes
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-2">
        <button
          onClick={handleRedeem}
          disabled={isPending}
          className="w-full bg-[#e6c364] text-[#3d2e00] font-headline font-bold uppercase tracking-widest py-5 rounded-md hover:brightness-110 active:scale-[0.98] transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-press"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-[#3d2e00]/30 border-t-[#3d2e00] animate-spin" />
              Canjeando...
            </>
          ) : (
            <>
              <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                redeem
              </span>
              Canjear reward
            </>
          )}
        </button>
      </div>

      <Link
        href="/scan"
        className="flex items-center justify-center gap-1.5 text-[#d0c5b2] text-[11px] uppercase tracking-[0.2em] font-semibold hover:opacity-70 transition-opacity py-2"
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          close
        </span>
        Cancelar y volver
      </Link>
    </div>
  );
}
