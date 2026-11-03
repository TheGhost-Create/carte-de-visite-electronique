import { templateRegistry } from "../templates/templateRegistry";
import type {
  BrandProfile,
  DetectedCardFields,
  ExtractableCardField,
  TemplateDefinition,
  TemplatePalette,
  VirtualCardData,
} from "../types/card";
import { readFileAsDataUrl } from "../utils/imageFiles";

export type TemplateRecommendation = {
  id: string;
  name: string;
  reason: string;
};

export type LogoAnalysisResult = {
  imageSrc: string;
  profile: BrandProfile;
  recommendations: TemplateRecommendation[];
  message: string;
  provider: "mistral" | "local";
};

export type LegacyCardScanResult = {
  imageSrc: string;
  fields: DetectedCardFields;
  message: string;
  provider: "mistral" | "local";
};

export type VantajSuggestion = {
  id: string;
  title: string;
  body: string;
  patch?: Partial<VirtualCardData>;
  templateId?: string;
};

type ServerAiResponse = {
  provider?: "mistral";
  data?: unknown;
  error?: string;
  warning?: string;
};

const extractableFields: ExtractableCardField[] = [
  "firstName",
  "lastName",
  "jobTitle",
  "company",
  "tagline",
  "phone",
  "whatsapp",
  "email",
  "website",
  "address",
];

const fallbackProfile: BrandProfile = {
  primaryColor: "#07111f",
  secondaryColor: "#4d6382",
  accentColor: "#b8cfff",
  background: "dark",
  contrast: "high",
  visualStyle: "premium corporate",
  typographyPreference: "clean sans serif",
  recommendedTemplates: ["signature-vantaj", "obsidian-flow", "midnight-metallic"],
  source: "local",
  notes: ["Analyse locale utilisee en attendant une route serveur Mistral disponible."],
};

export async function analyzeLogoWithVantajAi(
  file: File,
  context: VirtualCardData,
): Promise<LogoAnalysisResult> {
  const imageSrc = await readFileAsDataUrl(file);
  const localProfile = await analyzeImagePalette(imageSrc);

  try {
    const response = await requestServerAnalysis("logo", imageSrc, context);
    const profile = normalizeBrandProfile(response.data, localProfile);
    const recommendations = buildTemplateRecommendations(profile);

    return {
      imageSrc,
      profile: { ...profile, source: "mistral" },
      recommendations,
      provider: "mistral",
      message: "Analyse Mistral recue. Les propositions restent controlees avant application.",
    };
  } catch {
    const recommendations = buildTemplateRecommendations(localProfile);
    return {
      imageSrc,
      profile: localProfile,
      recommendations,
      provider: "local",
      message:
        "Endpoint Mistral non disponible ou cle absente. Vantaj AI utilise une analyse locale des couleurs sans extraction externe.",
    };
  }
}

export async function scanLegacyCardWithVantajAi(
  file: File,
  context: VirtualCardData,
): Promise<LegacyCardScanResult> {
  const imageSrc = await readFileAsDataUrl(file);

  try {
    const response = await requestServerAnalysis("legacy-card", imageSrc, context);
    return {
      imageSrc,
      fields: normalizeDetectedFields(response.data),
      provider: "mistral",
      message:
        "Informations detectees par Mistral. Verifiez chaque champ avant de les appliquer a la carte.",
    };
  } catch {
    return {
      imageSrc,
      fields: {},
      provider: "local",
      message:
        "Extraction automatique indisponible sans route serveur Mistral. Aucun champ n'a ete rempli silencieusement.",
    };
  }
}

export function mergeTemplateWithBrandProfile(
  template: TemplateDefinition,
  profile?: BrandProfile,
): TemplateDefinition {
  if (!profile) {
    return template;
  }

  const palette: TemplatePalette = {
    primary: profile.background === "dark" ? profile.accentColor : profile.primaryColor,
    secondary: profile.secondaryColor,
    surface: profile.background === "dark" ? profile.primaryColor : "#f7f9fc",
    text: profile.background === "dark" ? "#ffffff" : "#07111f",
    muted: profile.background === "dark" ? "#aebbd0" : "#5f6e82",
    metallic: profile.accentColor,
  };

  return {
    ...template,
    palette,
  };
}

export function buildTemplateRecommendations(profile: BrandProfile): TemplateRecommendation[] {
  const isDark = profile.background === "dark";
  const style = profile.visualStyle.toLowerCase();
  const rankedIds = [
    ...profile.recommendedTemplates,
    ...(style.includes("tech") || style.includes("digital")
      ? ["digital-grid", "glass-card", "neo-corporate"]
      : []),
    ...(isDark
      ? ["signature-vantaj", "obsidian-flow", "midnight-metallic", "executive-black"]
      : ["arctic-minimal", "silver-architecture", "pearl-navy"]),
    "sapphire-edge",
  ];

  const uniqueIds = Array.from(new Set(rankedIds));

  return uniqueIds
    .map((id) => templateRegistry.find((template) => template.id === id))
    .filter(Boolean)
    .slice(0, 3)
    .map((template, index) => ({
      id: template!.id,
      name: template!.name,
      reason:
        index === 0
          ? `Meilleur alignement avec un fond ${isDark ? "sombre" : "clair"} et un style ${profile.visualStyle}.`
          : `Bonne compatibilite avec la palette ${profile.primaryColor} / ${profile.secondaryColor}.`,
    }));
}

export function createAssistantSuggestions(
  prompt: string,
  data: VirtualCardData,
  profile?: BrandProfile,
): VantajSuggestion[] {
  const normalizedPrompt = prompt.trim().toLowerCase();
  const missing = getMissingFields(data);
  const suggestions: VantajSuggestion[] = [];

  if (
    !normalizedPrompt ||
    normalizedPrompt.includes("slogan") ||
    normalizedPrompt.includes("presentation") ||
    normalizedPrompt.includes("profession")
  ) {
    suggestions.push({
      id: "tagline-pro",
      title: "Suggestion de slogan",
      body: makeProfessionalTagline(data),
      patch: { tagline: makeProfessionalTagline(data) },
    });
  }

  if (
    normalizedPrompt.includes("template") ||
    normalizedPrompt.includes("style") ||
    normalizedPrompt.includes("correspond")
  ) {
    const recommendation = buildTemplateRecommendations(profile ?? fallbackProfile)[0];
    if (recommendation) {
      suggestions.push({
        id: `template-${recommendation.id}`,
        title: `Template recommande: ${recommendation.name}`,
        body: recommendation.reason,
        templateId: recommendation.id,
      });
    }
  }

  if (
    normalizedPrompt.includes("manque") ||
    normalizedPrompt.includes("charge") ||
    normalizedPrompt.includes("champ") ||
    missing.length > 0
  ) {
    suggestions.push({
      id: "missing-fields",
      title: "Champs a verifier",
      body:
        missing.length > 0
          ? `Il manque encore: ${missing.join(", ")}. Completez ces champs pour une carte plus credible.`
          : "Les champs essentiels sont renseignes. Vous pouvez enrichir la bio ou les reseaux sociaux.",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "bio-pro",
      title: "Amelioration de bio",
      body: makeProfessionalBio(data),
      patch: { bio: makeProfessionalBio(data) },
    });
  }

  return suggestions.slice(0, 3);
}

async function requestServerAnalysis(
  kind: "logo" | "legacy-card",
  imageDataUrl: string,
  context: VirtualCardData,
) {
  const response = await fetch("/api/vantaj-ai/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ kind, imageDataUrl, context }),
  });

  const payload = (await response.json().catch(() => ({}))) as ServerAiResponse;

  if (!response.ok || payload.error) {
    throw new Error(payload.error ?? "Analyse Vantaj AI indisponible.");
  }

  return payload;
}

async function analyzeImagePalette(imageSrc: string): Promise<BrandProfile> {
  try {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement("canvas");
    const size = 96;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      return fallbackProfile;
    }

    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(image, 0, 0, size, size);
    const pixels = ctx.getImageData(0, 0, size, size).data;
    const buckets = new Map<string, { count: number; r: number; g: number; b: number; score: number }>();
    let rTotal = 0;
    let gTotal = 0;
    let bTotal = 0;
    let count = 0;
    let luminanceTotal = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = pixels[index + 3];
      if (alpha < 48) {
        continue;
      }

      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const luminance = getLuminance(r, g, b);
      const saturation = getSaturation(r, g, b);
      const key = `${Math.round(r / 24) * 24}-${Math.round(g / 24) * 24}-${Math.round(b / 24) * 24}`;
      const existing = buckets.get(key);
      const score = 1 + saturation * 1.8 + Math.abs(0.5 - luminance) * 0.4;

      if (existing) {
        existing.count += 1;
        existing.r += r;
        existing.g += g;
        existing.b += b;
        existing.score += score;
      } else {
        buckets.set(key, { count: 1, r, g, b, score });
      }

      rTotal += r;
      gTotal += g;
      bTotal += b;
      luminanceTotal += luminance;
      count += 1;
    }

    if (count === 0) {
      return fallbackProfile;
    }

    const ranked = Array.from(buckets.values())
      .map((bucket) => ({
        r: Math.round(bucket.r / bucket.count),
        g: Math.round(bucket.g / bucket.count),
        b: Math.round(bucket.b / bucket.count),
        score: bucket.count * (bucket.score / bucket.count),
      }))
      .sort((a, b) => b.score - a.score);

    const primary = ranked[0] ?? {
      r: Math.round(rTotal / count),
      g: Math.round(gTotal / count),
      b: Math.round(bTotal / count),
    };
    const secondary = ranked.find((color) => colorDistance(color, primary) > 70) ?? ranked[1] ?? primary;
    const averageLuminance = luminanceTotal / count;
    const primaryLuminance = getLuminance(primary.r, primary.g, primary.b);
    const background = averageLuminance > 0.66 ? "light" : "dark";
    const accentColor = primaryLuminance > 0.52 ? "#07111f" : "#ffffff";
    const contrastScore = Math.abs(primaryLuminance - getLuminanceFromHex(accentColor));
    const visualStyle = getVisualStyle(primary, secondary, averageLuminance);

    const profile: BrandProfile = {
      primaryColor: rgbToHex(primary.r, primary.g, primary.b),
      secondaryColor: rgbToHex(secondary.r, secondary.g, secondary.b),
      accentColor,
      background,
      contrast: contrastScore > 0.62 ? "high" : contrastScore > 0.38 ? "medium" : "low",
      visualStyle,
      typographyPreference: visualStyle.includes("minimal") ? "minimal sans serif" : "clean sans serif",
      recommendedTemplates: recommendTemplateIds(background, visualStyle),
      source: "local",
      notes: [
        "Couleurs detectees localement dans le navigateur.",
        "Connectez MISTRAL_API_KEY cote serveur pour l'analyse visuelle et OCR avancee.",
      ],
    };

    return profile;
  } catch {
    return fallbackProfile;
  }
}

function normalizeBrandProfile(data: unknown, localProfile: BrandProfile): BrandProfile {
  const record = toRecord(data);
  const style = stringValue(record.visualStyle) || stringValue(record.style) || localProfile.visualStyle;
  const background =
    stringValue(record.background) === "light" || stringValue(record.recommendedBackground) === "light"
      ? "light"
      : stringValue(record.background) === "dark" || stringValue(record.recommendedBackground) === "dark"
        ? "dark"
        : localProfile.background;
  const recommendedTemplates = arrayOfStrings(record.recommendedTemplates).filter((id) =>
    templateRegistry.some((template) => template.id === id),
  );

  return {
    primaryColor: sanitizeHex(record.primaryColor, localProfile.primaryColor),
    secondaryColor: sanitizeHex(record.secondaryColor, localProfile.secondaryColor),
    accentColor: sanitizeHex(record.accentColor, localProfile.accentColor),
    background,
    contrast: normalizeContrast(record.contrast, localProfile.contrast),
    visualStyle: style,
    typographyPreference:
      stringValue(record.typographyPreference) || localProfile.typographyPreference,
    recommendedTemplates:
      recommendedTemplates.length > 0 ? recommendedTemplates : localProfile.recommendedTemplates,
    source: "mistral",
    notes: arrayOfStrings(record.notes),
  };
}

function normalizeDetectedFields(data: unknown): DetectedCardFields {
  const record = toRecord(toRecord(data).fields ?? data);
  const fields: DetectedCardFields = {};

  for (const field of extractableFields) {
    const value = record[field];

    if (typeof value === "string" && value.trim()) {
      fields[field] = {
        value: value.trim(),
        confidence: "medium",
        note: "A verifier",
      };
      continue;
    }

    const objectValue = toRecord(value);
    if (typeof objectValue.value === "string" && objectValue.value.trim()) {
      fields[field] = {
        value: objectValue.value.trim(),
        confidence: normalizeConfidence(objectValue.confidence),
        note: stringValue(objectValue.note),
      };
    }
  }

  return fields;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image illisible."));
    image.src = src;
  });
}

function getVisualStyle(
  primary: { r: number; g: number; b: number },
  secondary: { r: number; g: number; b: number },
  averageLuminance: number,
) {
  const saturation = Math.max(getSaturation(primary.r, primary.g, primary.b), getSaturation(secondary.r, secondary.g, secondary.b));

  if (saturation > 0.5 && averageLuminance < 0.54) {
    return "technology premium";
  }

  if (saturation < 0.16 && averageLuminance > 0.68) {
    return "minimal corporate";
  }

  if (averageLuminance < 0.4) {
    return "premium corporate";
  }

  return "modern professional";
}

function recommendTemplateIds(background: BrandProfile["background"], visualStyle: string) {
  if (visualStyle.includes("tech")) {
    return ["digital-grid", "glass-card", "neo-corporate"];
  }

  if (background === "light") {
    return ["arctic-minimal", "silver-architecture", "pearl-navy"];
  }

  return ["signature-vantaj", "obsidian-flow", "midnight-metallic"];
}

function makeProfessionalTagline(data: VirtualCardData) {
  const role = data.jobTitle || "expert";
  const company = data.company ? ` chez ${data.company}` : "";
  return `${role}${company} - des solutions claires, memorables et orientees resultat.`;
}

function makeProfessionalBio(data: VirtualCardData) {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ") || "Ce profil";
  const role = data.jobTitle || "professionnel";
  const company = data.company ? ` pour ${data.company}` : "";
  return `${fullName} accompagne ses clients avec une approche ${role.toLowerCase()}${company}, pensee pour transformer chaque contact en opportunite concrete.`;
}

function getMissingFields(data: VirtualCardData) {
  return [
    !data.firstName && "prenom",
    !data.lastName && "nom",
    !data.jobTitle && "fonction",
    !data.company && "entreprise",
    !data.email && "email",
    !data.phone && "telephone",
    !data.website && "site web",
  ].filter(Boolean) as string[];
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function sanitizeHex(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : fallback;
}

function getLuminance(r: number, g: number, b: number) {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getLuminanceFromHex(hex: string) {
  const value = hex.replace("#", "");
  return getLuminance(
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  );
}

function getSaturation(r: number, g: number, b: number) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;

  if (max === 0) {
    return 0;
  }

  return (max - min) / max;
}

function colorDistance(
  colorA: { r: number; g: number; b: number },
  colorB: { r: number; g: number; b: number },
) {
  return Math.sqrt(
    (colorA.r - colorB.r) ** 2 + (colorA.g - colorB.g) ** 2 + (colorA.b - colorB.b) ** 2,
  );
}

function normalizeContrast(value: unknown, fallback: BrandProfile["contrast"]) {
  return value === "low" || value === "medium" || value === "high" ? value : fallback;
}

function normalizeConfidence(value: unknown): "high" | "medium" | "low" {
  return value === "high" || value === "medium" || value === "low" ? value : "low";
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
