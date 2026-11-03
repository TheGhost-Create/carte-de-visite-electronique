import {
  Bot,
  Camera,
  Check,
  Loader2,
  MessageSquareText,
  Palette,
  ScanLine,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import type {
  BrandProfile,
  DetectedCardFields,
  ExtractableCardField,
  VirtualCardData,
} from "../../types/card";
import { readFileAsDataUrl, validateCardImageFile } from "../../utils/imageFiles";
import {
  analyzeLogoWithVantajAi,
  buildTemplateRecommendations,
  createAssistantSuggestions,
  scanLegacyCardWithVantajAi,
  type LogoAnalysisResult,
  type VantajSuggestion,
} from "../../services/vantajAi";

type VantajAIStudioProps = {
  data: VirtualCardData;
  selectedTemplateId: string;
  brandProfile?: BrandProfile;
  onDataChange: (data: VirtualCardData) => void;
  onBrandProfileChange: (profile: BrandProfile) => void;
  onTemplateSelect: (templateId: string) => void;
};

const loadingSteps = [
  "Analyse de votre identite visuelle...",
  "Extraction des couleurs...",
  "Analyse du style...",
  "Recherche des templates compatibles...",
  "Preparation de vos recommandations...",
];

const reviewFields: Array<[ExtractableCardField, string]> = [
  ["firstName", "Prenom"],
  ["lastName", "Nom"],
  ["jobTitle", "Fonction"],
  ["company", "Entreprise"],
  ["tagline", "Slogan"],
  ["phone", "Telephone"],
  ["whatsapp", "WhatsApp"],
  ["email", "Email"],
  ["website", "Site"],
  ["address", "Adresse"],
];

export function VantajAIStudio({
  data,
  selectedTemplateId,
  brandProfile,
  onDataChange,
  onBrandProfileChange,
  onTemplateSelect,
}: VantajAIStudioProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(data.logo ?? "");
  const [logoAnalysis, setLogoAnalysis] = useState<LogoAnalysisResult | null>(null);
  const [logoError, setLogoError] = useState("");
  const [isAnalyzingLogo, setIsAnalyzingLogo] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [legacyImage, setLegacyImage] = useState("");
  const [legacyFields, setLegacyFields] = useState<Partial<Record<ExtractableCardField, string>>>({});
  const [legacyDetected, setLegacyDetected] = useState<DetectedCardFields>({});
  const [legacyMessage, setLegacyMessage] = useState("");
  const [isScanningLegacy, setIsScanningLegacy] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantSuggestions, setAssistantSuggestions] = useState<VantajSuggestion[]>([]);

  const activeProfile = logoAnalysis?.profile ?? brandProfile;
  const activeRecommendations = activeProfile ? buildTemplateRecommendations(activeProfile) : [];

  useEffect(() => {
    setLogoPreview(data.logo ?? "");
  }, [data.logo]);

  const handleLogoInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError = validateCardImageFile(file);
    if (validationError) {
      setLogoError(validationError);
      return;
    }

    try {
      const preview = await readFileAsDataUrl(file);
      setLogoFile(file);
      setLogoPreview(preview);
      setLogoError("");
      onDataChange({ ...data, logo: preview });
    } catch {
      setLogoError("Impossible de lire ce logo.");
    }
  };

  const handleLogoAnalysis = async () => {
    if (!logoFile) {
      setLogoError("Importez un logo ou prenez une photo avant l'analyse.");
      return;
    }

    setIsAnalyzingLogo(true);
    setLogoError("");
    setLoadingStepIndex(0);

    const interval = window.setInterval(() => {
      setLoadingStepIndex((current) => Math.min(current + 1, loadingSteps.length - 1));
    }, 900);

    try {
      const result = await analyzeLogoWithVantajAi(logoFile, data);
      setLogoAnalysis(result);
      onDataChange({ ...data, logo: result.imageSrc });
    } catch {
      setLogoError("Vantaj AI n'a pas pu analyser cette image. Verifiez qu'elle est nette puis reessayez.");
    } finally {
      window.clearInterval(interval);
      setIsAnalyzingLogo(false);
    }
  };

  const applyBrandProfile = (profile: BrandProfile) => {
    onBrandProfileChange(profile);
  };

  const applyTemplateRecommendation = (templateId: string) => {
    if (activeProfile) {
      onBrandProfileChange(activeProfile);
    }
    onTemplateSelect(templateId);
  };

  const handleLegacyInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError = validateCardImageFile(file);
    if (validationError) {
      setLegacyMessage(validationError);
      return;
    }

    setIsScanningLegacy(true);
    setLegacyMessage("");

    try {
      const preview = await readFileAsDataUrl(file);
      setLegacyImage(preview);
      const result = await scanLegacyCardWithVantajAi(file, data);
      const nextFields = fieldValuesFromDetected(result.fields);
      setLegacyDetected(result.fields);
      setLegacyFields(nextFields);
      setLegacyMessage(result.message);
      setLegacyImage(result.imageSrc);
    } catch {
      setLegacyMessage("Vantaj AI n'a pas pu lire cette image. Utilisez une image plus nette.");
    } finally {
      setIsScanningLegacy(false);
    }
  };

  const updateLegacyField =
    (field: ExtractableCardField) => (event: ChangeEvent<HTMLInputElement>) => {
      setLegacyFields((current) => ({ ...current, [field]: event.target.value }));
    };

  const applyVerifiedLegacyFields = () => {
    const patch = Object.fromEntries(
      Object.entries(legacyFields).filter(([, value]) => value.trim().length > 0),
    ) as Partial<VirtualCardData>;

    onDataChange({ ...data, ...patch });
  };

  const submitAssistantPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAssistantSuggestions(createAssistantSuggestions(assistantPrompt, data, activeProfile));
    setAssistantPrompt("");
  };

  const applySuggestion = (suggestion: VantajSuggestion) => {
    if (suggestion.patch) {
      onDataChange({ ...data, ...suggestion.patch });
    }

    if (suggestion.templateId) {
      onTemplateSelect(suggestion.templateId);
    }

    setAssistantSuggestions((current) => current.filter((item) => item.id !== suggestion.id));
  };

  return (
    <section className="vantaj-ai-panel" aria-labelledby="vantaj-ai-title">
      <div className="section-heading">
        <div>
          <p>Vantaj AI</p>
          <h2 id="vantaj-ai-title">Assistant intelligent de creation</h2>
        </div>
        <span>{brandProfile ? "Brand Profile actif" : "Pret a analyser"}</span>
      </div>

      <div className="ai-grid">
        <article className="ai-module">
          <header className="ai-module__header">
            <Palette aria-hidden="true" size={18} />
            <div>
              <h3>Importer mon logo</h3>
              <p>Couleurs, style et templates recommandes.</p>
            </div>
          </header>

          <div className="ai-upload-row">
            <div className={`ai-image-preview ${logoPreview ? "has-image" : ""}`}>
              {logoPreview ? <img src={logoPreview} alt="Logo importe" /> : <Sparkles aria-hidden="true" />}
            </div>
            <div className="ai-button-row">
              <label className="ai-action-button">
                <Upload aria-hidden="true" size={15} />
                Choisir
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoInput}
                />
              </label>
              <label className="ai-action-button">
                <Camera aria-hidden="true" size={15} />
                Photo
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleLogoInput}
                />
              </label>
              <button
                type="button"
                className="ai-primary-button"
                onClick={handleLogoAnalysis}
                disabled={isAnalyzingLogo}
              >
                {isAnalyzingLogo ? <Loader2 aria-hidden="true" size={15} /> : <Bot aria-hidden="true" size={15} />}
                Analyser avec Vantaj AI
              </button>
            </div>
          </div>

          {isAnalyzingLogo && <p className="ai-loading">{loadingSteps[loadingStepIndex]}</p>}
          {logoError && <p className="form-message form-message--error">{logoError}</p>}
          {logoAnalysis && (
            <div className="ai-result">
              <p className="form-message">{logoAnalysis.message}</p>
              <div className="brand-profile-card">
                <div className="brand-swatches" aria-label="Palette detectee">
                  <span style={{ background: logoAnalysis.profile.primaryColor }} />
                  <span style={{ background: logoAnalysis.profile.secondaryColor }} />
                  <span style={{ background: logoAnalysis.profile.accentColor }} />
                </div>
                <div>
                  <strong>{logoAnalysis.profile.visualStyle}</strong>
                  <p>
                    Fond {logoAnalysis.profile.background}, contraste {logoAnalysis.profile.contrast}.
                  </p>
                </div>
                <button type="button" onClick={() => applyBrandProfile(logoAnalysis.profile)}>
                  <Check aria-hidden="true" size={14} />
                  Appliquer le profil
                </button>
              </div>
            </div>
          )}

          {activeRecommendations.length > 0 && (
            <div className="ai-recommendations">
              <h4>Vantaj AI recommande</h4>
              {activeRecommendations.map((recommendation, index) => (
                <div className="ai-recommendation" key={recommendation.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{recommendation.name}</strong>
                    <p>{recommendation.reason}</p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={selectedTemplateId === recommendation.id}
                    onClick={() => applyTemplateRecommendation(recommendation.id)}
                  >
                    Appliquer
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="ai-module">
          <header className="ai-module__header">
            <ScanLine aria-hidden="true" size={18} />
            <div>
              <h3>Scanner mon ancienne carte</h3>
              <p>Extraction controlee, avec validation manuelle obligatoire.</p>
            </div>
          </header>

          <div className="ai-upload-row">
            <div className={`ai-image-preview ai-image-preview--wide ${legacyImage ? "has-image" : ""}`}>
              {legacyImage ? <img src={legacyImage} alt="Ancienne carte importee" /> : <ScanLine aria-hidden="true" />}
            </div>
            <div className="ai-button-row">
              <label className="ai-action-button">
                <Upload aria-hidden="true" size={15} />
                Importer
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLegacyInput}
                />
              </label>
              <label className="ai-action-button">
                <Camera aria-hidden="true" size={15} />
                Photo
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleLegacyInput}
                />
              </label>
            </div>
          </div>

          {isScanningLegacy && <p className="ai-loading">Extraction des informations de contact...</p>}
          {legacyMessage && <p className="form-message">{legacyMessage}</p>}
          {(legacyImage || Object.keys(legacyFields).length > 0) && (
            <div className="legacy-review">
              <h4>Informations detectees - veuillez verifier</h4>
              <div className="legacy-review__fields">
                {reviewFields.map(([field, label]) => (
                  <label key={field}>
                    <span>
                      {label}
                      {legacyDetected[field] && <em>{legacyDetected[field]?.confidence}</em>}
                    </span>
                    <input value={legacyFields[field] ?? ""} onChange={updateLegacyField(field)} />
                  </label>
                ))}
              </div>
              <button type="button" className="ai-primary-button" onClick={applyVerifiedLegacyFields}>
                <Check aria-hidden="true" size={15} />
                Appliquer les donnees verifiees
              </button>
            </div>
          )}
        </article>

        <article className="ai-module ai-module--conversation">
          <header className="ai-module__header">
            <MessageSquareText aria-hidden="true" size={18} />
            <div>
              <h3>Assistant conversationnel</h3>
              <p>Les actions proposees attendent toujours votre validation.</p>
            </div>
          </header>

          <form className="ai-chat-form" onSubmit={submitAssistantPrompt}>
            <input
              value={assistantPrompt}
              onChange={(event) => setAssistantPrompt(event.target.value)}
              placeholder="Ex: Ameliore mon slogan"
            />
            <button type="submit" aria-label="Envoyer a Vantaj AI">
              <Sparkles aria-hidden="true" size={16} />
            </button>
          </form>

          <div className="ai-suggestion-list">
            {assistantSuggestions.length === 0 ? (
              <p className="ai-empty">Demandez un slogan, un template ou les champs manquants.</p>
            ) : (
              assistantSuggestions.map((suggestion) => (
                <div className="ai-suggestion" key={suggestion.id}>
                  <div>
                    <strong>{suggestion.title}</strong>
                    <p>{suggestion.body}</p>
                  </div>
                  <div className="ai-suggestion__actions">
                    {(suggestion.patch || suggestion.templateId) && (
                      <button type="button" onClick={() => applySuggestion(suggestion)}>
                        <Check aria-hidden="true" size={14} />
                        Appliquer
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setAssistantSuggestions((current) =>
                          current.filter((item) => item.id !== suggestion.id),
                        )
                      }
                    >
                      <X aria-hidden="true" size={14} />
                      Ignorer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function fieldValuesFromDetected(fields: DetectedCardFields) {
  return Object.fromEntries(
    Object.entries(fields).map(([field, detected]) => [field, detected.value]),
  ) as Partial<Record<ExtractableCardField, string>>;
}
