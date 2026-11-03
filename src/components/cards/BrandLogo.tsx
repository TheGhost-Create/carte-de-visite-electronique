import { brandLogoSrc } from "../../design/tokens";

type BrandLogoProps = {
  variant?: "dark" | "light" | "monochrome";
  src?: string;
  markOnly?: boolean;
  className?: string;
};

export function BrandLogo({
  variant = "dark",
  src = brandLogoSrc,
  markOnly = false,
  className = "",
}: BrandLogoProps) {
  return (
    <div
      className={`brand-logo brand-logo--${variant} ${markOnly ? "brand-logo--mark" : ""} ${className}`}
      aria-label="Vantaj CardLink"
    >
      <img src={src} alt="Vantaj CardLink logo" />
    </div>
  );
}
