import {
  Facebook,
  Globe2,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
  Video,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import type { SocialPlatform, VirtualCardData } from "../../types/card";

export function getFullName(data: VirtualCardData) {
  return [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
}

export function getInitials(data: VirtualCardData) {
  const first = data.firstName?.charAt(0) ?? "";
  const last = data.lastName?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase() || "VC";
}

export type ContactItem = {
  key: string;
  label: string;
  value: string;
  href?: string;
  icon: LucideIcon;
};

export function getContactItems(data: VirtualCardData): ContactItem[] {
  return [
    data.phone && {
      key: "phone",
      label: "Phone",
      value: data.phone,
      href: `tel:${data.phone.replace(/\s/g, "")}`,
      icon: Phone,
    },
    data.whatsapp && {
      key: "whatsapp",
      label: "WhatsApp",
      value: data.whatsapp,
      href: `https://wa.me/${data.whatsapp.replace(/[^\d]/g, "")}`,
      icon: MessageCircle,
    },
    data.email && {
      key: "email",
      label: "Email",
      value: data.email,
      href: `mailto:${data.email}`,
      icon: Mail,
    },
    data.website && {
      key: "website",
      label: "Website",
      value: data.website.replace(/^https?:\/\//, ""),
      href: data.website,
      icon: Globe2,
    },
    data.address && {
      key: "address",
      label: "Address",
      value: data.address,
      icon: MapPin,
    },
  ].filter(Boolean) as ContactItem[];
}

export const socialMeta: Record<
  SocialPlatform,
  { label: string; icon: LucideIcon; short: string }
> = {
  linkedin: { label: "LinkedIn", icon: Linkedin, short: "in" },
  facebook: { label: "Facebook", icon: Facebook, short: "fb" },
  instagram: { label: "Instagram", icon: Instagram, short: "ig" },
  twitter: { label: "X", icon: Twitter, short: "x" },
  tiktok: { label: "TikTok", icon: Video, short: "tt" },
  youtube: { label: "YouTube", icon: Youtube, short: "yt" },
};

export function ensureHttps(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `https://${value}`;
}

export function escapeVCard(value = ""): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export function buildVCardString(data: VirtualCardData): string {
  const fullName = getFullName(data) || "Contact";
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(data.lastName || "")};${escapeVCard(data.firstName || "")};;;`,
    `FN:${escapeVCard(fullName)}`,
    data.company && `ORG:${escapeVCard(data.company)}`,
    data.jobTitle && `TITLE:${escapeVCard(data.jobTitle)}`,
    data.phone && `TEL;TYPE=CELL,VOICE:${escapeVCard(data.phone)}`,
    data.whatsapp && `TEL;TYPE=WHATSAPP:${escapeVCard(data.whatsapp)}`,
    data.email && `EMAIL;TYPE=INTERNET,WORK:${escapeVCard(data.email)}`,
    data.website && `URL:${escapeVCard(data.website)}`,
    data.address && `ADR;TYPE=WORK:;;${escapeVCard(data.address)};;;;`,
    (data.tagline || data.bio) &&
      `NOTE:${escapeVCard([data.tagline, data.bio].filter(Boolean).join(" - "))}`,
    "END:VCARD",
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildShareableCardUrl(data: VirtualCardData): string {
  if (typeof window === "undefined") {
    return data.qrCodeUrl || data.website || "https://vantaj-cardlink.example";
  }

  // Create lightweight copy of data without massive base64 images so URL remains short
  const lightweightData: Partial<VirtualCardData> = {
    firstName: data.firstName,
    lastName: data.lastName,
    jobTitle: data.jobTitle,
    company: data.company,
    tagline: data.tagline,
    bio: data.bio,
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    website: data.website,
    address: data.address,
    socials: data.socials,
  };

  try {
    const encoded = encodeURIComponent(JSON.stringify(lightweightData));
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}#card=${encoded}`;
  } catch {
    return data.website || window.location.href;
  }
}

export function getEffectiveQrCodePayload(data: VirtualCardData): string {
  const mode = data.qrCodeMode || "vcard";

  if (mode === "vcard") {
    return buildVCardString(data);
  }

  if (mode === "profile_url") {
    return buildShareableCardUrl(data);
  }

  if (mode === "custom_url") {
    return data.qrCodeUrl || data.website || buildShareableCardUrl(data);
  }

  return buildVCardString(data);
}
