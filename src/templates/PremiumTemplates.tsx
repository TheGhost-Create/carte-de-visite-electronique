import type { ReactNode } from "react";
import type { VirtualCardData, VirtualCardProps } from "../types/card";
import { BrandLogo } from "../components/cards/BrandLogo";
import { CardActions } from "../components/cards/CardActions";
import { CardContact } from "../components/cards/CardContact";
import { CardIdentity } from "../components/cards/CardIdentity";
import { CardQRCode } from "../components/cards/CardQRCode";
import { CardSocials } from "../components/cards/CardSocials";
import { getFullName, getInitials } from "../components/cards/cardUtils";

type TemplateShellProps = {
  name: string;
  className: string;
  children: ReactNode;
};

function TemplateShell({ name, className, children }: TemplateShellProps) {
  return (
    <article className={`vc-card ${className}`} aria-label={`${name} virtual business card`}>
      {children}
    </article>
  );
}

function MiniLogo({ data, variant = "dark" }: { data: VirtualCardData; variant?: "dark" | "light" | "monochrome" }) {
  return <BrandLogo src={data.logo} variant={variant} markOnly />;
}

function Monogram({ data }: { data: VirtualCardData }) {
  return <div className="card-monogram" aria-hidden="true">{getInitials(data)}</div>;
}

function DecorativeLines() {
  return (
    <svg className="decor-lines" viewBox="0 0 500 315" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-20 238 C120 130 210 350 520 82" />
      <path d="M-30 290 C92 178 260 328 520 132" />
      <path d="M80 -20 L440 335" />
      <path d="M180 -10 L520 255" />
    </svg>
  );
}

export function ObsidianFlow({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Obsidian Flow" className="template-obsidian-flow">
      <div className="fluid-layer fluid-layer-a" />
      <div className="fluid-layer fluid-layer-b" />
      <header>
        <MiniLogo data={data} variant="light" />
        <CardQRCode value={data.qrCodeUrl} size={68} tone="dark" />
      </header>
      <CardIdentity data={data} showPhoto={false} />
      <CardContact data={data} limit={3} compact />
      <CardSocials data={data} compact />
    </TemplateShell>
  );
}

export function SilverArchitecture({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Silver Architecture" className="template-silver-architecture">
      <DecorativeLines />
      <div className="silver-plate" />
      <header>
        <MiniLogo data={data} variant="dark" />
        <span>CardLink ID</span>
      </header>
      <div className="split-content">
        <CardIdentity data={data} showPhoto compact />
        <aside>
          <CardContact data={data} limit={4} compact />
          <CardQRCode value={data.qrCodeUrl} size={66} tone="light" />
        </aside>
      </div>
    </TemplateShell>
  );
}

export function MidnightMetallic({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Midnight Metallic" className="template-midnight-metallic">
      <div className="metal-highlight" />
      <header>
        <MiniLogo data={data} variant="light" />
        <span className="serial">VNTJ-01</span>
      </header>
      <main>
        <CardIdentity data={data} showPhoto={false} />
        <CardContact data={data} limit={3} compact />
      </main>
      <footer>
        <CardSocials data={data} compact />
        <CardQRCode value={data.qrCodeUrl} size={62} tone="dark" />
      </footer>
    </TemplateShell>
  );
}

export function ArcticMinimal({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Arctic Minimal" className="template-arctic-minimal">
      <header>
        <MiniLogo data={data} variant="dark" />
        <CardQRCode value={data.qrCodeUrl} size={58} tone="light" />
      </header>
      <div className="arctic-body">
        <CardIdentity data={data} showPhoto={false} />
        <CardContact data={data} limit={3} compact />
      </div>
      <CardActions data={data} compact />
    </TemplateShell>
  );
}

export function TitaniumWave({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Titanium Wave" className="template-titanium-wave">
      <div className="titanium-wave titanium-wave-a" />
      <div className="titanium-wave titanium-wave-b" />
      <header>
        <MiniLogo data={data} variant="light" />
        <CardQRCode value={data.qrCodeUrl} size={64} tone="dark" />
      </header>
      <CardIdentity data={data} showPhoto />
      <CardContact data={data} limit={3} compact />
    </TemplateShell>
  );
}

export function ExecutiveBlack({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Executive Black" className="template-executive-black">
      <header>
        <MiniLogo data={data} variant="light" />
        <span>Private Network</span>
      </header>
      <div className="executive-center">
        <CardIdentity data={data} showPhoto={false} align="center" />
        <div className="executive-rule" />
        <CardContact data={data} limit={2} compact />
      </div>
      <footer>
        <CardSocials data={data} compact />
        <CardQRCode value={data.qrCodeUrl} size={56} tone="dark" />
      </footer>
    </TemplateShell>
  );
}

export function DigitalGrid({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Digital Grid" className="template-digital-grid">
      <div className="grid-scan" />
      <header>
        <MiniLogo data={data} variant="light" />
        <span>{data.company || "Digital Identity"}</span>
      </header>
      <div className="grid-content">
        <CardIdentity data={data} showPhoto compact />
        <CardQRCode value={data.qrCodeUrl} size={72} tone="dark" />
      </div>
      <CardContact data={data} limit={3} compact />
    </TemplateShell>
  );
}

export function GlassCard({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Glass Card" className="template-glass-card">
      <div className="glass-orbit" />
      <div className="glass-surface">
        <header>
          <MiniLogo data={data} variant="light" />
          <CardQRCode value={data.qrCodeUrl} size={58} tone="dark" />
        </header>
        <CardIdentity data={data} showPhoto />
        <CardContact data={data} limit={3} compact />
        <CardSocials data={data} compact />
      </div>
    </TemplateShell>
  );
}

export function SapphireEdge({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Sapphire Edge" className="template-sapphire-edge">
      <div className="sapphire-edge" />
      <header>
        <MiniLogo data={data} variant="light" />
        <span>Edge Profile</span>
      </header>
      <main>
        <CardIdentity data={data} showPhoto={false} />
        <CardContact data={data} limit={3} compact />
      </main>
      <CardQRCode value={data.qrCodeUrl} size={66} tone="dark" />
    </TemplateShell>
  );
}

export function MonogramLuxury({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Monogram Luxury" className="template-monogram-luxury">
      <MiniLogo data={data} variant="light" />
      <Monogram data={data} />
      <div className="monogram-copy">
        <h3>{getFullName(data)}</h3>
        {data.jobTitle && <p>{data.jobTitle}</p>}
      </div>
      <footer>
        <CardContact data={data} limit={2} compact />
        <CardQRCode value={data.qrCodeUrl} size={54} tone="dark" />
      </footer>
    </TemplateShell>
  );
}

export function CorporateSplit({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Corporate Split" className="template-corporate-split">
      <section className="split-left">
        <MiniLogo data={data} variant="light" />
        <CardIdentity data={data} showPhoto align="center" compact />
      </section>
      <section className="split-right">
        <CardContact data={data} limit={4} compact />
        <CardSocials data={data} compact />
        <CardActions data={data} compact />
        <CardQRCode value={data.qrCodeUrl} size={58} tone="light" />
      </section>
    </TemplateShell>
  );
}

export function DynamicRibbon({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Dynamic Ribbon" className="template-dynamic-ribbon">
      <svg className="ribbon-svg" viewBox="0 0 500 315" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-40 95 C85 5 151 204 284 116 C392 45 446 56 540 8" />
        <path d="M-32 226 C110 138 197 305 318 210 C405 142 476 156 540 105" />
      </svg>
      <header>
        <MiniLogo data={data} variant="light" />
        <CardQRCode value={data.qrCodeUrl} size={58} tone="dark" />
      </header>
      <CardIdentity data={data} showPhoto={false} />
      <CardContact data={data} limit={3} compact />
    </TemplateShell>
  );
}

export function NeoCorporate({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Neo Corporate" className="template-neo-corporate">
      <div className="neo-block neo-block-a" />
      <div className="neo-block neo-block-b" />
      <header>
        <MiniLogo data={data} variant="light" />
        <span>{data.company}</span>
      </header>
      <main>
        <CardIdentity data={data} showPhoto={false} />
        <CardContact data={data} limit={3} compact />
      </main>
      <footer>
        <CardActions data={data} compact />
        <CardQRCode value={data.qrCodeUrl} size={54} tone="dark" />
      </footer>
    </TemplateShell>
  );
}

export function PearlNavy({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Pearl & Navy" className="template-pearl-navy">
      <DecorativeLines />
      <header>
        <MiniLogo data={data} variant="dark" />
        <CardQRCode value={data.qrCodeUrl} size={56} tone="light" />
      </header>
      <main>
        <CardIdentity data={data} showPhoto />
        <CardContact data={data} limit={3} compact />
      </main>
      <CardSocials data={data} compact />
    </TemplateShell>
  );
}

export function SignatureVantaj({ data }: VirtualCardProps) {
  return (
    <TemplateShell name="Signature Vantaj" className="template-signature-vantaj">
      <div className="signature-flow" />
      <div className="signature-grid" />
      <header>
        <MiniLogo data={data} variant="light" />
        <span>Premium Digital Identity</span>
      </header>
      <main>
        <CardIdentity data={data} showPhoto />
        {data.bio && <p className="signature-bio">{data.bio}</p>}
      </main>
      <footer>
        <div>
          <CardContact data={data} limit={3} compact />
          <CardSocials data={data} compact />
        </div>
        <CardQRCode value={data.qrCodeUrl} size={68} tone="dark" />
      </footer>
    </TemplateShell>
  );
}
