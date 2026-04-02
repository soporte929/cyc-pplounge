import { StampGrid } from "@/components/stamp-grid";
import { QRCodeDisplay } from "@/components/qr-code";

interface LoyaltyCardProps {
  customerName: string;
  stampsCurrent: number;
  stampsRequired: number;
  rewardName: string | null;
  rewardAvailable: boolean;
  cardId: string;
}

export function LoyaltyCard({
  customerName: _customerName,
  stampsCurrent,
  stampsRequired,
  rewardName,
  rewardAvailable,
  cardId,
}: LoyaltyCardProps) {
  const stampsToNext = Math.max(0, stampsRequired - stampsCurrent);
  const progressPercent = Math.min(
    100,
    Math.round((stampsCurrent / stampsRequired) * 100)
  );

  const confettiDots = [
    { left: "10%", top: "20%", delay: "0ms", color: "#e6c364" },
    { left: "25%", top: "10%", delay: "100ms", color: "#e6c364" },
    { left: "50%", top: "5%", delay: "200ms", color: "#fff8dc" },
    { left: "70%", top: "15%", delay: "80ms", color: "#e6c364" },
    { left: "85%", top: "25%", delay: "160ms", color: "#fff8dc" },
    { left: "15%", top: "60%", delay: "240ms", color: "#e6c364" },
    { left: "90%", top: "50%", delay: "50ms", color: "#fff8dc" },
    { left: "40%", top: "70%", delay: "180ms", color: "#e6c364" },
    { left: "60%", top: "80%", delay: "120ms", color: "#fff8dc" },
    { left: "80%", top: "70%", delay: "300ms", color: "#e6c364" },
  ];

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Main card surface */}
      <div className="bg-surface-container-highest rounded-xl p-8 relative overflow-hidden">
        {/* Confetti dots — shown when reward is available */}
        {rewardAvailable &&
          confettiDots.map((dot, idx) => (
            <span
              key={idx}
              className="absolute w-1.5 h-1.5 rounded-full opacity-0 pointer-events-none"
              style={{
                left: dot.left,
                top: dot.top,
                backgroundColor: dot.color,
                animation: `confetti-fall 1.2s ease-out forwards`,
                animationDelay: dot.delay,
              }}
            />
          ))}

        {/* Premium badge watermark */}
        <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
          <span
            className="material-symbols-outlined text-primary text-6xl leading-none"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_bar
          </span>
        </div>

        {/* Stamp grid */}
        <div className="mb-6">
          <StampGrid
            stampsCurrent={stampsCurrent}
            stampsRequired={stampsRequired}
          />
        </div>

        {/* Counter */}
        <div className="mb-3">
          <span className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">
            {stampsCurrent} / {stampsRequired} SHISHAS
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-surface-container-lowest rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 animate-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Progress label */}
        <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">
          {stampsToNext > 0
            ? `Consigue ${stampsToNext} sello${stampsToNext === 1 ? "" : "s"} más para desbloquear tu próximo reward`
            : "¡Has alcanzado tu reward!"}
        </p>
      </div>

      {/* Reward available banner */}
      {rewardAvailable && rewardName && (
        <div className="bg-primary-container p-6 rounded-xl flex items-center gap-4 animate-bounce-in">
          <span
            className="material-symbols-outlined text-on-primary-container text-3xl leading-none flex-shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            redeem
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-primary-container/70 mb-0.5">
              Tu reward está listo
            </p>
            <p className="font-headline font-bold uppercase tracking-tight text-on-primary-container text-lg leading-tight">
              TU {rewardName} GRATIS ESTÁ LISTO
            </p>
          </div>
        </div>
      )}

      {/* QR code section */}
      <div className="flex flex-col items-center gap-3 bg-surface-container-lowest rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <div className="w-40 h-40 bg-white rounded-lg p-2">
          <QRCodeDisplay value={cardId} size={144} />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
          Muestra en el mostrador
        </p>
      </div>
    </div>
  );
}
