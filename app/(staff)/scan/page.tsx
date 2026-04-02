"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import QRScanner from "@/components/qr-scanner";
import { StaffNav } from "@/components/staff-nav";
import { addStamp, getCardInfo } from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type CardInfo = Awaited<ReturnType<typeof getCardInfo>>;

type State =
  | { phase: "scanning" }
  | { phase: "confirming"; card: NonNullable<CardInfo> }
  | {
      phase: "success";
      cardId: string;
      stampsCurrent: number;
      rewardUnlocked: boolean;
      rewardName?: string;
    }
  | { phase: "error"; message: string };

// ─── Error helpers ────────────────────────────────────────────────────────────

function formatAddStampError(
  error: string,
  minutesRemaining?: number
): string {
  switch (error) {
    case "cooldown":
      return minutesRemaining
        ? `Sello añadido recientemente. Inténtalo de nuevo en ${minutesRemaining} minuto${minutesRemaining === 1 ? "" : "s"}.`
        : "Sello añadido recientemente. Espera antes de añadir otro.";
    case "card_not_found":
      return "Tarjeta de fidelidad no encontrada. El QR puede ser inválido.";
    case "card_inactive":
      return "Esta tarjeta de fidelidad está inactiva.";
    case "not_authenticated":
      return "Sesión expirada. Por favor inicia sesión de nuevo.";
    case "staff_not_found":
      return "Cuenta de staff no encontrada. Contacta con el administrador.";
    case "staff_inactive":
      return "Tu cuenta de staff está inactiva. Contacta con el administrador.";
    case "validation_error":
      return "Formato de ID de tarjeta inválido.";
    case "db_error":
      return "Error de base de datos. Por favor, inténtalo de nuevo.";
    default:
      return "Error inesperado. Por favor, inténtalo de nuevo.";
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StampDots({
  current,
  required,
}: {
  current: number;
  required: number;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {Array.from({ length: required }).map((_, i) => (
        <div
          key={i}
          className={[
            "w-4 h-4 rounded-full transition-all",
            i < current
              ? "bg-[#e6c364] shadow-[0_0_8px_rgba(230,195,100,0.4)]"
              : "bg-[#0e0e0e] border border-[#4d4637]/30",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function StatusIdle() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span
        className="material-symbols-outlined text-3xl text-[#e6c364]/60"
        aria-hidden="true"
      >
        info
      </span>
      <p className="font-headline font-bold uppercase tracking-tighter text-[#e5e2e1]">
        Escanea el QR del cliente
      </p>
      <p className="text-sm text-[#d0c5b2] leading-relaxed">
        Apunta la cámara al QR de la tarjeta de fidelidad del cliente para añadir un sello.
      </p>
    </div>
  );
}

function StatusConfirming({
  card,
  onConfirm,
  isPending,
}: {
  card: NonNullable<CardInfo>;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const initials = card.customerName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-5 text-center animate-fade-in-up">
      {/* Avatar */}
      <div className="w-14 h-14 rounded-full bg-[#353534] border border-[#e6c364]/20 flex items-center justify-center">
        <span className="text-lg font-bold text-[#e6c364] font-headline">
          {initials}
        </span>
      </div>

      {/* Customer name */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-1">
          Cliente
        </p>
        <p className="font-headline font-extrabold uppercase tracking-tighter text-[#e5e2e1] text-xl">
          {card.customerName}
        </p>
      </div>

      {/* Stamp count */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2] mb-3">
          {card.stampsCurrent} / {card.stampsRequired} sellos
        </p>
        <StampDots
          current={card.stampsCurrent}
          required={card.stampsRequired}
        />
      </div>

      {/* Near-reward warning banner */}
      {card.stampsCurrent >= card.stampsRequired - 2 && (
        <div className="w-full flex items-center gap-3 bg-[#e6c364]/10 border border-[#e6c364]/30 rounded-xl px-4 py-3 animate-bounce-in">
          <span
            className="material-symbols-outlined text-xl text-[#e6c364] shrink-0"
            aria-hidden="true"
          >
            trending_up
          </span>
          <p className="text-sm font-bold text-[#e6c364] text-left">
            {card.stampsCurrent === card.stampsRequired - 1
              ? "¡Este sello completa su reward!"
              : "¡Casi tiene su reward!"}
          </p>
        </div>
      )}

      {/* Add stamp CTA */}
      <button
        onClick={onConfirm}
        disabled={isPending}
        className="w-full bg-[#e6c364] text-[#3d2e00] font-headline font-bold uppercase tracking-widest py-4 rounded-md transition-opacity disabled:opacity-60 hover:opacity-90 active:scale-[0.98] btn-press"
      >
        {isPending ? "Añadiendo sello…" : "Añadir sello"}
      </button>
    </div>
  );
}

function StatusSuccess({
  stampsCurrent,
  rewardUnlocked,
  rewardName,
  cardId,
  onNext,
}: {
  stampsCurrent: number;
  rewardUnlocked: boolean;
  rewardName?: string;
  cardId: string;
  onNext: () => void;
}) {
  useEffect(() => {
    if (rewardUnlocked && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [rewardUnlocked]);

  return (
    <div className="flex flex-col items-center gap-5 text-center animate-scale-in">
      {/* Checkmark */}
      <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
        <span
          className="material-symbols-outlined text-3xl text-green-400 animate-bounce-in"
          aria-hidden="true"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
      </div>

      <div>
        <p className="font-headline font-extrabold uppercase tracking-tighter text-[#e5e2e1] text-xl">
          Sello añadido
        </p>
        <p className="text-sm text-[#d0c5b2] mt-1">
          {stampsCurrent} sello{stampsCurrent === 1 ? "" : "s"} en total
        </p>
      </div>

      {/* Reward unlocked banner */}
      {rewardUnlocked && (
        <Link
          href={`/redeem/${cardId}`}
          className="w-full flex items-center justify-between gap-3 bg-[#e6c364]/10 border border-[#e6c364]/30 rounded-xl px-5 py-4 hover:bg-[#e6c364]/15 transition-colors animate-bounce-in"
          style={{ animationDelay: "150ms" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-2xl text-[#e6c364]"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              redeem
            </span>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest text-[#e6c364]">
                ¡Reward desbloqueado!
              </p>
              {rewardName && (
                <p className="text-sm font-bold text-[#e5e2e1]">{rewardName}</p>
              )}
            </div>
          </div>
          <span
            className="material-symbols-outlined text-xl text-[#e6c364]/60"
            aria-hidden="true"
          >
            arrow_forward
          </span>
        </Link>
      )}

      {/* Next customer */}
      <button
        onClick={onNext}
        className="w-full border border-[#99907e]/30 text-[#d0c5b2] font-headline font-bold uppercase tracking-widest py-4 rounded-md hover:bg-white/5 active:scale-[0.98] transition-all btn-press"
      >
        Siguiente cliente
      </button>
    </div>
  );
}

function StatusError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
      <div className="w-full bg-[#ffb4ab]/5 border border-[#ffb4ab]/20 rounded-xl px-5 py-4 flex flex-col items-center gap-3">
        <span
          className="material-symbols-outlined text-3xl text-[#ffb4ab]"
          aria-hidden="true"
        >
          error
        </span>
        <p className="text-sm text-[#ffb4ab] leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="w-full border border-[#99907e]/30 text-[#d0c5b2] font-headline font-bold uppercase tracking-widest py-4 rounded-md hover:bg-white/5 active:scale-[0.98] transition-all btn-press"
      >
        Reintentar
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScanPage() {
  const [state, setState] = useState<State>({ phase: "scanning" });
  const [isPending, startTransition] = useTransition();

  // Step 1 — QR scanned: fetch card info
  const handleScan = useCallback((uuid: string) => {
    // Ignore new scans while already processing
    if (state.phase !== "scanning") return;

    startTransition(async () => {
      const card = await getCardInfo(uuid);

      if (!card) {
        setState({
          phase: "error",
          message: "Tarjeta de fidelidad no encontrada. El QR puede ser inválido.",
        });
        return;
      }

      if (!card.isActive) {
        setState({ phase: "error", message: "Esta tarjeta de fidelidad está inactiva." });
        return;
      }

      setState({ phase: "confirming", card });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const handleScanError = useCallback((error: string) => {
    setState({ phase: "error", message: error });
  }, []);

  // Step 2 — confirm: add stamp
  const handleAddStamp = useCallback(() => {
    if (state.phase !== "confirming") return;
    const { card } = state;

    startTransition(async () => {
      const result = await addStamp(card.cardId);

      if (!result.success) {
        setState({
          phase: "error",
          message: formatAddStampError(result.error, result.minutes_remaining),
        });
        return;
      }

      setState({
        phase: "success",
        cardId: card.cardId,
        stampsCurrent: result.stamps_current,
        rewardUnlocked: result.reward_unlocked,
        rewardName: result.reward_name,
      });
    });
  }, [state]);

  // Reset to scanning
  const handleReset = useCallback(() => {
    setState({ phase: "scanning" });
  }, []);

  const isScanning = state.phase === "scanning";

  return (
    <div className="min-h-screen bg-[#131313] flex flex-col">
      {/* ── Header ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-[#0e0e0e] border-b border-[#e6c364]/10 shadow-[0_4px_40px_rgba(230,195,100,0.04)] flex items-center px-5">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-[#d0c5b2] font-medium">
            Personal
          </span>
          <span className="font-headline font-black uppercase tracking-widest text-[#e6c364] leading-none animate-logo-breathe">
            PHI PHI LOUNGE
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[#d0c5b2]">
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            qr_code_scanner
          </span>
          <p className="text-[10px] uppercase tracking-widest">
            Escanear
          </p>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-28 px-5">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Scanner */}
          <div className={isScanning ? "opacity-100" : "opacity-50 pointer-events-none"}>
            <QRScanner onScan={handleScan} onError={handleScanError} />
          </div>

          {/* Status area */}
          <div className="bg-[#353534] rounded-xl p-6 transition-all">
            {state.phase === "scanning" && <StatusIdle />}

            {state.phase === "confirming" && (
              <StatusConfirming
                card={state.card}
                onConfirm={handleAddStamp}
                isPending={isPending}
              />
            )}

            {state.phase === "success" && (
              <StatusSuccess
                stampsCurrent={state.stampsCurrent}
                rewardUnlocked={state.rewardUnlocked}
                rewardName={state.rewardName}
                cardId={state.cardId}
                onNext={handleReset}
              />
            )}

            {state.phase === "error" && (
              <StatusError message={state.message} onRetry={handleReset} />
            )}
          </div>
        </div>
      </main>

      {/* ── Bottom nav ── */}
      <StaffNav />
    </div>
  );
}
