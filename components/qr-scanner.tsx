"use client";
import { useEffect, useRef, useState } from "react";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  const [cameraError, setCameraError] = useState<{ message: string; icon: string } | null>(null);
  const [ready, setReady] = useState(false);
  const scannedRef = useRef(false);

  onScanRef.current = onScan;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval>;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }

        // Method 1: BarcodeDetector (Chrome, Edge, Android)
        if ("BarcodeDetector" in window) {
          try {
            const BarcodeDetectorClass = (window as Record<string, unknown>).BarcodeDetector as new (opts: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
            const detector = new BarcodeDetectorClass({ formats: ["qr_code"] });

            intervalId = setInterval(async () => {
              if (cancelled || !videoRef.current || scannedRef.current) return;
              if (videoRef.current.readyState < 2) return;

              try {
                const codes = await detector.detect(videoRef.current);
                if (codes.length > 0 && !scannedRef.current) {
                  const uuid = extractUUID(codes[0].rawValue);
                  if (uuid) {
                    scannedRef.current = true;
                    clearInterval(intervalId);
                    onScanRef.current(uuid);
                  }
                }
              } catch {
                // detection error on frame — skip
              }
            }, 250);

            return; // Using BarcodeDetector, don't try jsQR
          } catch {
            // BarcodeDetector failed to init, fall through
          }
        }

        // Method 2: Canvas-based with jsQR-like manual decode via qr-scanner
        // Use setInterval to periodically capture frame and scan
        const QrScanner = (await import("qr-scanner")).default;

        if (cancelled || !videoRef.current) return;

        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (scannedRef.current) return;
            const uuid = extractUUID(result.data);
            if (uuid) {
              scannedRef.current = true;
              scanner.stop();
              onScanRef.current(uuid);
            }
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: false,
            highlightCodeOutline: false,
          }
        );

        await scanner.start();
      } catch (err) {
        if (cancelled) return;

        const message = err instanceof Error ? err.message : "";
        const isPermission = message.toLowerCase().includes("permission") || message.toLowerCase().includes("notallowed") || message.toLowerCase().includes("denied");
        const isInsecure = typeof window !== "undefined" && window.location.protocol !== "https:" && window.location.hostname !== "localhost";

        setCameraError({
          message: isInsecure
            ? "La cámara requiere conexión segura (HTTPS)."
            : isPermission
              ? "Acceso a la cámara denegado. Permite el acceso en los ajustes del navegador."
              : "No se pudo iniciar la cámara. Asegúrate de que ninguna otra app la esté usando.",
          icon: isInsecure ? "lock_open" : "no_photography",
        });
        onErrorRef.current?.(message);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // Reset scan lock when parent changes onScan (e.g. "Next Customer")
  useEffect(() => {
    scannedRef.current = false;
  }, [onScan]);

  if (cameraError) {
    return (
      <div className="relative w-full aspect-square bg-[#1c1b1b] rounded-[2rem] overflow-hidden flex flex-col items-center justify-center gap-4 p-8">
        <span className="material-symbols-outlined text-5xl text-[#e6c364]/60" aria-hidden="true">
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
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />

      {/* Dark vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(13,13,13,0.7) 100%)" }} />

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
        {!ready && (
          <p className="text-[10px] uppercase tracking-widest text-[#d0c5b2]">
            Iniciando cámara...
          </p>
        )}
        {ready && (
          <div className="w-24 h-0.5 rounded-full overflow-hidden bg-[#e6c364]/20">
            <div className="h-full bg-[#e6c364] rounded-full"
              style={{ animation: "scan-pulse 1.8s ease-in-out infinite" }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan-pulse {
          0%, 100% { opacity: 0.3; transform: scaleX(0.4); }
          50%       { opacity: 1; transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
