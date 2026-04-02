export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#131313]">
      <div className="flex flex-col items-center gap-4">
        <span className="text-[#e6c364] font-headline font-black text-2xl uppercase tracking-widest animate-logo-breathe">
          PHI PHI LOUNGE
        </span>
        <div className="w-48 h-1 rounded-full overflow-hidden bg-[#1c1b1b]">
          <div
            className="h-full rounded-full"
            style={{
              animation: "shimmer-bar 1.5s ease-in-out infinite",
              backgroundSize: "200% 100%",
              background:
                "linear-gradient(90deg, transparent 25%, #e6c364 50%, transparent 75%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
