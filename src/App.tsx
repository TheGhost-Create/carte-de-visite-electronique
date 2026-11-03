import {
  BarChart3,
  ExternalLink,
  Eye,
  Home,
  Palette,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataEditor } from "./components/cards/DataEditor";
import { ExportPanel } from "./components/cards/ExportPanel";
import { Card3DStage } from "./components/cards/Card3DStage";
import { CardRenderer } from "./components/cards/CardRenderer";
import { TemplateSelector } from "./components/cards/TemplateSelector";
import { VantajAIStudio } from "./components/cards/VantajAIStudio";
import { BrandLogo } from "./components/cards/BrandLogo";
import { PublicCardView } from "./components/public/PublicCardView";
import { DashboardView } from "./components/dashboard/DashboardView";
import { LandingView } from "./components/landing/LandingView";
import type { BrandProfile, VirtualCardData } from "./types/card";
import { mergeTemplateWithBrandProfile } from "./services/vantajAi";
import {
  loadStoredBrandProfile,
  loadStoredCardData,
  loadStoredTemplateId,
  saveStoredBrandProfile,
  saveStoredCardData,
  saveStoredTemplateId,
} from "./services/cardStorage";
import {
  defaultTemplateId,
  getTemplateById,
  templateRegistry,
} from "./templates/templateRegistry";

type ViewMode = "studio" | "landing" | "public" | "dashboard";

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("studio");
  const [cardData, setCardData] = useState<VirtualCardData>(() => loadStoredCardData());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => loadStoredTemplateId());
  const [brandProfile, setBrandProfile] = useState<BrandProfile | undefined>(() =>
    loadStoredBrandProfile(),
  );
  const [hasViewed3DPreview, setHasViewed3DPreview] = useState(false);
  const [hasValidated3D, setHasValidated3D] = useState(false);

  // Auto-save state to localStorage
  useEffect(() => {
    saveStoredCardData(cardData);
  }, [cardData]);

  useEffect(() => {
    saveStoredTemplateId(selectedTemplateId);
  }, [selectedTemplateId]);

  useEffect(() => {
    saveStoredBrandProfile(brandProfile);
  }, [brandProfile]);

  const selectedTemplate = useMemo(
    () => getTemplateById(selectedTemplateId),
    [selectedTemplateId],
  );

  const effectiveTemplate = useMemo(
    () => mergeTemplateWithBrandProfile(selectedTemplate, brandProfile),
    [brandProfile, selectedTemplate],
  );

  const galleryTemplates = useMemo(
    () =>
      templateRegistry.map((template) =>
        mergeTemplateWithBrandProfile(template, brandProfile),
      ),
    [brandProfile],
  );

  useEffect(() => {
    setHasViewed3DPreview(false);
    setHasValidated3D(false);
  }, [cardData, selectedTemplateId, brandProfile]);

  const open3DPreview = () => {
    setHasViewed3DPreview(true);
    document.getElementById("three-d")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleEditCardFromDashboard = (templateId?: string) => {
    if (templateId) {
      setSelectedTemplateId(templateId);
    }
    setViewMode("studio");
  };

  const handleSelectSavedCard = (savedData: VirtualCardData, templateId: string) => {
    setCardData(savedData);
    setSelectedTemplateId(templateId);
  };

  return (
    <div className="app-shell">
      {/* Top Application Header */}
      <header className="app-header">
        <button
          type="button"
          className="app-brand"
          onClick={() => setViewMode("studio")}
          aria-label="Vantaj CardLink Studio"
        >
          <BrandLogo variant="light" />
        </button>

        {/* Global View Switcher */}
        <div className="view-switcher" role="tablist" aria-label="Modes de vue">
          <button
            type="button"
            className={`view-tab ${viewMode === "studio" ? "is-active" : ""}`}
            onClick={() => setViewMode("studio")}
            role="tab"
            aria-selected={viewMode === "studio"}
          >
            <Palette size={15} />
            <span>Studio</span>
          </button>
          <button
            type="button"
            className={`view-tab ${viewMode === "landing" ? "is-active" : ""}`}
            onClick={() => setViewMode("landing")}
            role="tab"
            aria-selected={viewMode === "landing"}
          >
            <Home size={15} />
            <span>Vitrine</span>
          </button>
          <button
            type="button"
            className={`view-tab ${viewMode === "public" ? "is-active" : ""}`}
            onClick={() => setViewMode("public")}
            role="tab"
            aria-selected={viewMode === "public"}
          >
            <Eye size={15} />
            <span>Profil Public</span>
          </button>
          <button
            type="button"
            className={`view-tab ${viewMode === "dashboard" ? "is-active" : ""}`}
            onClick={() => setViewMode("dashboard")}
            role="tab"
            aria-selected={viewMode === "dashboard"}
          >
            <BarChart3 size={15} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Studio sub-navigation or quick action */}
        {viewMode === "studio" ? (
          <nav className="studio-nav" aria-label="Sections du studio">
            <a href="#studio">Studio</a>
            <a href="#vantaj-ai">Vantaj AI</a>
            <a href="#templates">Templates</a>
            <a href="#three-d">3D Preview</a>
            <a href="#export">Export</a>
          </nav>
        ) : (
          <button
            type="button"
            className="btn-header-primary"
            onClick={() => setViewMode("studio")}
          >
            <Sparkles size={15} />
            <span>Éditeur Studio</span>
          </button>
        )}
      </header>

      {/* Main Content Area based on selected View Mode */}
      {viewMode === "landing" && (
        <LandingView
          data={cardData}
          template={effectiveTemplate}
          onOpenStudio={() => setViewMode("studio")}
          onOpenPublicView={() => setViewMode("public")}
          onOpenDashboard={() => setViewMode("dashboard")}
        />
      )}

      {viewMode === "public" && (
        <PublicCardView
          data={cardData}
          template={effectiveTemplate}
          onOpenStudio={() => setViewMode("studio")}
        />
      )}

      {viewMode === "dashboard" && (
        <DashboardView
          data={cardData}
          template={effectiveTemplate}
          onEditCard={handleEditCardFromDashboard}
          onSelectSavedCard={handleSelectSavedCard}
        />
      )}

      {viewMode === "studio" && (
        <main>
          {/* Studio Hero with 3D Preview */}
          <section className="studio-hero" id="studio">
            <div className="hero-copy">
              <p className="eyebrow">
                <Sparkles aria-hidden="true" size={16} />
                Vantaj CardLink Template Studio
              </p>
              <h1>Votre identité numérique, sculptée en temps réel.</h1>
              <p>
                Studio complet React pour la création assistée par IA, 15 templates d'exception,
                données unifiées, QR Code, stage WebGL 3D, validation et export multi-format.
              </p>
              <div className="hero-quick-actions">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setViewMode("public")}
                >
                  <Eye size={14} />
                  <span>Aperçu profil destinataire</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setViewMode("dashboard")}
                >
                  <BarChart3 size={14} />
                  <span>Voir le dashboard</span>
                </button>
              </div>
            </div>

            <div className="hero-card-preview" id="three-d">
              <Card3DStage
                data={cardData}
                template={effectiveTemplate}
                onInteraction={() => setHasViewed3DPreview(true)}
              />
            </div>
          </section>

          {/* Data Editor & Live Selected Card Preview */}
          <section className="studio-workbench" aria-label="Atelier de configuration">
            <DataEditor data={cardData} onChange={setCardData} />
            <section className="selected-preview" aria-labelledby="selected-preview-title">
              <div className="section-heading">
                <div>
                  <p>Template Actif</p>
                  <h2 id="selected-preview-title">{selectedTemplate.name}</h2>
                </div>
                <span>{selectedTemplate.category}</span>
              </div>
              <CardRenderer template={effectiveTemplate} data={cardData} />
              <p className="selected-preview__note">{selectedTemplate.description}</p>
            </section>
          </section>

          {/* Vantaj AI Studio (Logo analyzer, OCR scanner, Assistant) */}
          <div id="vantaj-ai">
            <VantajAIStudio
              data={cardData}
              selectedTemplateId={selectedTemplateId}
              brandProfile={brandProfile}
              onDataChange={setCardData}
              onBrandProfileChange={setBrandProfile}
              onTemplateSelect={setSelectedTemplateId}
            />
          </div>

          {/* 15 Templates Gallery */}
          <div id="templates">
            <TemplateSelector
              templates={galleryTemplates}
              selectedId={selectedTemplateId}
              data={cardData}
              onSelect={setSelectedTemplateId}
            />
          </div>

          {/* Export & Validation Panel */}
          <div id="export">
            <ExportPanel
              data={cardData}
              template={effectiveTemplate}
              hasViewed3DPreview={hasViewed3DPreview}
              hasValidated3D={hasValidated3D}
              onOpen3DPreview={open3DPreview}
              onValidate3D={() => setHasValidated3D(true)}
            />
          </div>
        </main>
      )}
    </div>
  );
}
