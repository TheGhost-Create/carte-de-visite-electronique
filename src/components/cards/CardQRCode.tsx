import QRCodeGenerator from "qrcode";
import { useEffect, useState } from "react";

type CardQRCodeProps = {
  value?: string;
  size?: number;
  tone?: "dark" | "light";
  label?: string;
  className?: string;
};

export function CardQRCode({
  value,
  size = 92,
  tone = "light",
  label = "QR code",
  className = "",
}: CardQRCodeProps) {
  const [source, setSource] = useState<string>("");

  useEffect(() => {
    let isActive = true;
    const qrValue = value || "https://vantaj-cardlink.example";

    QRCodeGenerator.toDataURL(qrValue, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: size * 2,
      color: {
        dark: tone === "light" ? "#07111f" : "#ffffff",
        light: tone === "light" ? "#ffffff" : "#07111f",
      },
    }).then((url) => {
      if (isActive) {
        setSource(url);
      }
    });

    return () => {
      isActive = false;
    };
  }, [size, tone, value]);

  return (
    <div
      className={`card-qr card-qr--${tone} ${className}`}
      style={{ width: size, height: size }}
      aria-label={label}
    >
      {source ? <img src={source} alt={label} /> : <span>QR</span>}
    </div>
  );
}
