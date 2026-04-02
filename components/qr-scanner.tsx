"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface QRScannerProps {
  onScan: (uuid: string) => void;
  onError?: (error: string) => void;
}

const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function extractUUID(text: string): string | null {
  const match = text.match(UUID_REGEX);
  return match ? match[0] : null;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<import("qr-scanner").default | null>(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  const [cameraError, setCameraError] = useState<{ message: string; icon: string } | null>(null);
  const hasScanned = useRef(false);

  // Keep refs up to date without re-triggering effect
  onScanRef.current = onScan;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!videoRef.current) return;

      try {
        const QrScanner = (await import("qr-scanner")).default;

        if (cancelled) return;

        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (hasScanned.current) return;
            const text = result.data;
            const uuid = extractUUID(text);
            if (uuid) {
              hasScanned.current = true;
              onScanRef.current(uuid);
            }
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: false,
            highlightCodeOutline: false,
          }
        );

        scannerRef.current = scanner;
        await scanner.start();
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "Camera error occurred.";

        const isPermission =
          message.toLowerCase().includes("permission") ||
          message.toLowerCase().includes("notallowed") ||
          message.toLowerCase().includes("denied");

        const isInsecure =
          typeof window !== "undefined" &&
          window.location.protocol !== "https:" &&
          window.location.hostname !== "localhost";

        const userMessage = isInsecure
          ? "La cámara requiere conexión segura (HTTPS)."
          : isPermission
            ? "Acceso a la cámara denegado. Permite el acceso en los ajustes del navegador."
            : "No se pudo iniciar la cámara. Asegúrate de que ninguna otra app la esté usando.";

        const icon = isInsecure ? "lock_open" : "no_photography";

        setCameraError({ message: userMessage, icon });
        onErrorRef.current?.(userMessage);
      }
    }

    init();

    return () => {
      cancelled = true;
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, []); // No dependencies — refs handle callback updates

  // Reset scan lock when parent resets (e.g. "Next Customer")
  const resetScan = useCallback(() => {
    hasScanned.current = false;
  }, []);

  // Expose reset via effect when onScan changes (parent re-mounted)
  useEffect(() => {
    hasScanned.current = false;
  }, [onScan]);

  if (cameraError) {
    return (
      <div className="relative w-full aspect-square bg-[#1c1b1b] rounded-[2rem] overflow-hidden flex flex-col items-center justify-center gap-4 p-8">
        <span
          className="material-symbols-outlined text-5xl text-[#e6c364]/60"
          aria-hidden="true"
        >
          {cameraError.icon}
        </span>
        <p className="text-center text-sm text-[#d0c5b2] leading-relaxed">
          {cameraError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square bg-[#1c1b1b] rounded-[2rem] overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
      />

      {/* Dark vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(13,13,13,0.7) 100%)",
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-10 h-10 pointer-events-none"
        style={{ borderTop: "4px solid #e6c364", borderLeft: "4px solid #e6c364", borderRadius: "4px 0 0 0" }} />
      <div className="absolute top-8 right-8 w-10 h-10 pointer-events-none"
        style={{ borderTop: "4px solid #e6c364", borderRight: "4px solid #e6c364", borderRadius: "0 4px 0 0" }} />
      <div className="absolute bottom-8 left-8 w-10 h-10 pointer-events-none"
        style={{ borderBottom: "4px solid #e6c364", borderLeft: "4px solid #e6c364", borderRadius: "0 0 0 4px" }} />
      <div className="absolute bottom-8 right-8 w-10 h-10 pointer-events-none"
        style={{ borderBottom: "4px solid #e6c364", borderRight: "4px solid #e6c364", borderRadius: "0 0 4px 0" }} />

      {/* Center indicator */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
        <span className="material-symbols-outlined text-3xl text-[#e6c364]/80" aria-hidden="true">
          qr_code_scanner
        </span>
        <div className="w-24 h-0.5 rounded-full overflow-hidden bg-[#e6c364]/20">
          <div className="h-full bg-[#e6c364] rounded-full"
            style={{ animation: "scan-pulse 1.8s ease-in-out infinite" }} />
        </div>
      </div>

      <style>{`
        @keyframes scan-pulse {
          0%, 100% { opacity: 0.3; transform: scaleX(0.4); }
          50%       { opacity: 1;   transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
