"use client";
import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onScan: (uuid: string) => void;
  onError?: (error: string) => void;
}

// UUID v4 pattern
const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

function extractUUID(text: string): string | null {
  const match = text.match(UUID_REGEX);
  return match ? match[0] : null;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<import("qr-scanner").default | null>(null);
  const [cameraError, setCameraError] = useState<{ message: string; icon: string } | null>(null);

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
            const text = result.data;
            const uuid = extractUUID(text);
            if (uuid) {
              onScan(uuid);
            } else {
              onError?.("QR code does not contain a valid ID.");
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
          ? "Camera requires a secure connection (HTTPS). Open this page over HTTPS to use the scanner."
          : isPermission
            ? "Camera access was denied. Please allow camera permission in your browser settings and try again."
            : "Unable to start the camera. Make sure no other app is using it and that camera access is allowed.";

        const icon = isInsecure ? "lock_open" : "no_photography";

        setCameraError({ message: userMessage, icon });
        onError?.(userMessage);
      }
    }

    init();

    return () => {
      cancelled = true;
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, [onScan, onError]);

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
      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
      />

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(13,13,13,0.7) 100%)",
        }}
      />

      {/* Top-left corner bracket */}
      <div
        className="absolute top-8 left-8 w-10 h-10 pointer-events-none"
        style={{
          borderTop: "4px solid #e6c364",
          borderLeft: "4px solid #e6c364",
          borderRadius: "4px 0 0 0",
        }}
      />

      {/* Top-right corner bracket */}
      <div
        className="absolute top-8 right-8 w-10 h-10 pointer-events-none"
        style={{
          borderTop: "4px solid #e6c364",
          borderRight: "4px solid #e6c364",
          borderRadius: "0 4px 0 0",
        }}
      />

      {/* Bottom-left corner bracket */}
      <div
        className="absolute bottom-8 left-8 w-10 h-10 pointer-events-none"
        style={{
          borderBottom: "4px solid #e6c364",
          borderLeft: "4px solid #e6c364",
          borderRadius: "0 0 0 4px",
        }}
      />

      {/* Bottom-right corner bracket */}
      <div
        className="absolute bottom-8 right-8 w-10 h-10 pointer-events-none"
        style={{
          borderBottom: "4px solid #e6c364",
          borderRight: "4px solid #e6c364",
          borderRadius: "0 0 4px 0",
        }}
      />

      {/* Center indicator */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
        {/* Scanning icon */}
        <span
          className="material-symbols-outlined text-3xl text-[#e6c364]/80"
          aria-hidden="true"
        >
          qr_code_scanner
        </span>

        {/* Animated pulse bar */}
        <div className="w-24 h-0.5 rounded-full overflow-hidden bg-[#e6c364]/20">
          <div
            className="h-full bg-[#e6c364] rounded-full animate-pulse"
            style={{
              animation: "scan-pulse 1.8s ease-in-out infinite",
            }}
          />
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
