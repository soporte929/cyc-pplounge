"use client";

import QRCode from "react-qr-code";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export function QRCodeDisplay({ value, size = 160 }: QRCodeDisplayProps) {
  return (
    <QRCode
      value={value}
      size={size}
      bgColor="#ffffff"
      fgColor="#131313"
      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
    />
  );
}
