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

  return (
    <div className="space-y-4">
      {/* Main card surface */}
      <div className="bg-surface-container-highest rounded-xl p-8 relative overflow-hidden">
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
            className="h-full bg-primary rounded-full transition-all duration-500"
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
        <div className="bg-primary-container p-6 rounded-xl flex items-center gap-4">
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
      <div className="flex flex-col items-center gap-3 bg-surface-container-lowest rounded-xl p-6">
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
