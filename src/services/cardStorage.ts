import type { BrandProfile, VirtualCardData } from "../types/card";
import { demoCardData } from "../data/demoCard";
import { defaultTemplateId } from "../templates/templateRegistry";

export type CapturedLead = {
  id: string;
  cardId?: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  note?: string;
  createdAt: string;
};

export type CardAnalytics = {
  views: number;
  nfcTaps: number;
  contactSaves: number;
  shares: number;
  leadsCount: number;
  history: Array<{
    date: string;
    views: number;
    taps: number;
  }>;
};

export type SavedCardItem = {
  id: string;
  name: string;
  templateId: string;
  data: VirtualCardData;
  brandProfile?: BrandProfile;
  updatedAt: string;
  isPrimary?: boolean;
};

const CARD_DATA_KEY = "vantaj_cardlink_active_data";
const TEMPLATE_ID_KEY = "vantaj_cardlink_active_template";
const BRAND_PROFILE_KEY = "vantaj_cardlink_brand_profile";
const SAVED_CARDS_KEY = "vantaj_cardlink_saved_cards";
const LEADS_KEY = "vantaj_cardlink_leads";
const ANALYTICS_KEY = "vantaj_cardlink_analytics";

const defaultAnalytics: CardAnalytics = {
  views: 1248,
  nfcTaps: 412,
  contactSaves: 326,
  shares: 89,
  leadsCount: 14,
  history: [
    { date: "Lun", views: 142, taps: 48 },
    { date: "Mar", views: 189, taps: 62 },
    { date: "Mer", views: 230, taps: 78 },
    { date: "Jeu", views: 215, taps: 71 },
    { date: "Ven", views: 274, taps: 94 },
    { date: "Sam", views: 110, taps: 35 },
    { date: "Dim", views: 88, taps: 24 },
  ],
};

const defaultInitialLeads: CapturedLead[] = [
  {
    id: "lead-1",
    fullName: "Alexandre Dumas",
    email: "alexandre.dumas@innovatech.fr",
    phone: "+33 6 12 34 56 78",
    company: "InnovaTech Capital",
    note: "Rencontre au Sommet Tech Paris - Interesse par notre offre B2B",
    createdAt: "2026-08-12T10:30:00Z",
  },
  {
    id: "lead-2",
    fullName: "Sophie Laurent",
    email: "sophie.l@aurora-design.co",
    phone: "+33 7 98 76 54 32",
    company: "Aurora Studios",
    note: "Souhaite equiper 15 directeurs de compte avec nos cartes NFC",
    createdAt: "2026-08-13T14:15:00Z",
  },
  {
    id: "lead-3",
    fullName: "Marc Benamou",
    email: "m.benamou@nexus-ventures.com",
    phone: "+1 415 890 1234",
    company: "Nexus Ventures",
    note: "Echange lors du pitch deck - Souhaite recevoir notre vCard et brochure",
    createdAt: "2026-08-14T09:45:00Z",
  },
];

export function loadStoredCardData(): VirtualCardData {
  try {
    const raw = localStorage.getItem(CARD_DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.firstName) {
        return { ...demoCardData, ...parsed };
      }
    }
  } catch {
    // ignore
  }
  return demoCardData;
}

export function saveStoredCardData(data: VirtualCardData): void {
  try {
    localStorage.setItem(CARD_DATA_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadStoredTemplateId(): string {
  try {
    const raw = localStorage.getItem(TEMPLATE_ID_KEY);
    if (raw && typeof raw === "string" && raw.trim()) {
      return raw.trim();
    }
  } catch {
    // ignore
  }
  return defaultTemplateId;
}

export function saveStoredTemplateId(templateId: string): void {
  try {
    localStorage.setItem(TEMPLATE_ID_KEY, templateId);
  } catch {
    // ignore
  }
}

export function loadStoredBrandProfile(): BrandProfile | undefined {
  try {
    const raw = localStorage.getItem(BRAND_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.primaryColor) {
        return parsed as BrandProfile;
      }
    }
  } catch {
    // ignore
  }
  return undefined;
}

export function saveStoredBrandProfile(profile?: BrandProfile): void {
  try {
    if (profile) {
      localStorage.setItem(BRAND_PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(BRAND_PROFILE_KEY);
    }
  } catch {
    // ignore
  }
}

export function loadStoredLeads(): CapturedLead[] {
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return defaultInitialLeads;
}

export function saveStoredLead(lead: Omit<CapturedLead, "id" | "createdAt">): CapturedLead {
  const newLead: CapturedLead = {
    ...lead,
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const current = loadStoredLeads();
    const updated = [newLead, ...current];
    localStorage.setItem(LEADS_KEY, JSON.stringify(updated));
    incrementMetric("leadsCount");
    incrementMetric("contactSaves");
  } catch {
    // ignore
  }

  return newLead;
}

export function deleteStoredLead(id: string): void {
  try {
    const current = loadStoredLeads();
    const updated = current.filter((l) => l.id !== id);
    localStorage.setItem(LEADS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function loadStoredAnalytics(): CardAnalytics {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && typeof parsed.views === "number") {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return defaultAnalytics;
}

export function incrementMetric(metric: keyof Omit<CardAnalytics, "history">): void {
  try {
    const current = loadStoredAnalytics();
    const updated = {
      ...current,
      [metric]: current[metric] + 1,
    };
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function loadStoredSavedCards(): SavedCardItem[] {
  try {
    const raw = localStorage.getItem(SAVED_CARDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  return [
    {
      id: "card-primary",
      name: "Carte Professionnelle Vantaj",
      templateId: defaultTemplateId,
      data: demoCardData,
      updatedAt: "2026-08-14T12:00:00Z",
      isPrimary: true,
    },
    {
      id: "card-minimal",
      name: "Profil Minimaliste & Events",
      templateId: "arctic-minimal",
      data: {
        ...demoCardData,
        jobTitle: "Speaker & Identity Consultant",
        tagline: "Conférencière & Stratège",
      },
      updatedAt: "2026-08-10T15:30:00Z",
    },
  ];
}

export function saveStoredSavedCards(cards: SavedCardItem[]): void {
  try {
    localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(cards));
  } catch {
    // ignore
  }
}
