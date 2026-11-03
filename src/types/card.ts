import type { ComponentType } from "react";

export type SocialPlatform =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "twitter"
  | "tiktok"
  | "youtube";

export type TemplateCategory =
  | "Luxury"
  | "Corporate"
  | "Minimal"
  | "Technology"
  | "Signature";

export type QrCodeMode = "vcard" | "profile_url" | "custom_url";

export interface VirtualCardData {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  company?: string;
  tagline?: string;
  bio?: string;
  profileImage?: string;
  logo?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  socials?: Partial<Record<SocialPlatform, string>>;
  qrCodeUrl?: string;
  qrCodeMode?: QrCodeMode;
}

export type BrandBackground = "dark" | "light";

export interface BrandProfile {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  background: BrandBackground;
  contrast: "low" | "medium" | "high";
  visualStyle: string;
  typographyPreference: string;
  recommendedTemplates: string[];
  source: "mistral" | "local";
  notes?: string[];
}

export type ExtractableCardField =
  | "firstName"
  | "lastName"
  | "jobTitle"
  | "company"
  | "tagline"
  | "phone"
  | "whatsapp"
  | "email"
  | "website"
  | "address";

export interface DetectedCardField {
  value: string;
  confidence: "high" | "medium" | "low";
  note?: string;
}

export type DetectedCardFields = Partial<Record<ExtractableCardField, DetectedCardField>>;

export interface TemplatePalette {
  primary: string;
  secondary: string;
  surface: string;
  text: string;
  muted: string;
  metallic: string;
}

export interface VirtualCardProps {
  data: VirtualCardData;
  compact?: boolean;
  className?: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  component: ComponentType<VirtualCardProps>;
  palette: TemplatePalette;
}
