interface StampGridProps {
  stampsCurrent: number;
  stampsRequired: number;
}

export function StampGrid({ stampsCurrent, stampsRequired }: StampGridProps) {
  const filledCount = Math.min(stampsCurrent, stampsRequired);
  const extraStamps = stampsCurrent > stampsRequired ? stampsCurrent - stampsRequired : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: stampsRequired }, (_, i) => {
          const isFilled = i < filledCount;
          const isLastEmpty = !isFilled && i === stampsRequired - 1;

          if (isFilled) {
            return (
              <div
                key={i}
                className="aspect-square rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(230,195,100,0.3)]"
              >
                <span
                  className="material-symbols-outlined text-on-primary text-lg leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  spa
                </span>
              </div>
            );
          }

          if (isLastEmpty) {
            return (
              <div
                key={i}
                className="aspect-square rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-primary/40 text-lg leading-none">
                  redeem
                </span>
              </div>
            );
          }

          return (
            <div
              key={i}
              className="aspect-square rounded-full bg-surface-container-lowest border border-outline-variant/30"
            />
          );
        })}
      </div>

      {extraStamps > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/20 border border-primary-container/30">
            <span
              className="material-symbols-outlined text-primary-container text-sm leading-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              spa
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-container">
              +{extraStamps} extra
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
