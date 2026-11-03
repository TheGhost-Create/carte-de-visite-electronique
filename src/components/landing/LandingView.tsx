import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Cpu,
  Layers,
  Palette,
  QrCode,
  Radio,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import type { TemplateDefinition, VirtualCardData } from "../../types/card";
import { Card3DStage } from "../cards/Card3DStage";
import { CardRenderer } from "../cards/CardRenderer";
import { templateRegistry } from "../../templates/templateRegistry";

type LandingViewProps = {
  data: VirtualCardData;
  template: TemplateDefinition;
  onOpenStudio: () => void;
  onOpenPublicView: () => void;
  onOpenDashboard: () => void;
};

export function LandingView({
  data,
  template,
  onOpenStudio,
  onOpenPublicView,
  onOpenDashboard,
}: LandingViewProps) {
  const showcaseTemplates = templateRegistry.slice(0, 6);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <div className="landing-badge">
            <Sparkles size={15} className="text-primary" />
            <span>La nouvelle référence de la carte de visite connectée</span>
          </div>

          <h1 className="landing-title">
            Votre identité numérique. <br />
            <span className="landing-title-highlight">Plus élégante et puissante.</span>
          </h1>

          <p className="landing-subtitle">
            Concevez une carte de visite digitale inoubliable avec rendu 3D temps réel, 15
            templates de prestige, assistant IA de création et partage instantané NFC & QR Code.
          </p>

          <div className="landing-cta-group">
            <button type="button" className="btn-hero-primary" onClick={onOpenStudio}>
              <span>Ouvrir le Studio de création</span>
              <ArrowRight size={17} />
            </button>

            <button type="button" className="btn-hero-secondary" onClick={onOpenPublicView}>
              <Smartphone size={16} />
              <span>Tester la vue destinataire</span>
            </button>
          </div>

          <div className="landing-social-proof">
            <div className="proof-item">
              <CheckCircle2 size={16} className="text-primary" />
              <span>100% compatible iOS & Android</span>
            </div>
            <div className="proof-item">
              <CheckCircle2 size={16} className="text-primary" />
              <span>Aucune application requise</span>
            </div>
            <div className="proof-item">
              <CheckCircle2 size={16} className="text-primary" />
              <span>Export vCard & QR instantané</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive 3D Card */}
        <div className="landing-hero__3d">
          <div className="hero-stage-container">
            <Card3DStage data={data} template={template} />
          </div>
          <p className="stage-hint">Glissez votre doigt ou curseur pour orienter la carte en 3D</p>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="landing-section">
        <div className="section-title-wrap">
          <p className="eyebrow">Fonctionnalités Clés</p>
          <h2>Tout pour transformer chaque rencontre en opportunité</h2>
          <p className="section-desc">
            Une suite complète d'outils haut de gamme pour votre réseau professionnel.
          </p>
        </div>

        <div className="bento-grid">
          {/* Card 1: NFC & QR */}
          <div className="bento-card bento-card--featured">
            <div className="bento-icon bento-icon--blue">
              <Radio size={24} />
            </div>
            <h3>Partage sans contact NFC & QR universel</h3>
            <p>
              Approchez votre carte d'un smartphone ou faites scanner votre QR code pour transmettre
              instantanément l'ensemble de vos coordonnées et réseaux sans aucune saisie manuelle.
            </p>
            <div className="bento-visual bento-visual--nfc">
              <div className="nfc-pulse-ring" />
              <Radio size={40} className="text-primary relative z-10" />
            </div>
          </div>

          {/* Card 2: AI Studio */}
          <div className="bento-card">
            <div className="bento-icon bento-icon--purple">
              <Bot size={24} />
            </div>
            <h3>Assistant Vantaj AI</h3>
            <p>
              Importez votre logo pour que l'IA extrait vos teintes de marque et suggère les
              templates les plus adaptés, ou numérisez une ancienne carte papier en un éclair.
            </p>
            <div className="bento-tags">
              <span>Extraction palette</span>
              <span>OCR de carte</span>
              <span>Génération bio</span>
            </div>
          </div>

          {/* Card 3: 15 Premium Templates */}
          <div className="bento-card">
            <div className="bento-icon bento-icon--gold">
              <Layers size={24} />
            </div>
            <h3>15 Styles de Prestige</h3>
            <p>
              Des designs taillés pour chaque univers : Luxury sombre, Corporate structuré,
              Minimalisme épuré ou Signature futuriste.
            </p>
            <div className="bento-tags">
              <span>Obsidian Flow</span>
              <span>Signature Vantaj</span>
              <span>Glass Card</span>
            </div>
          </div>

          {/* Card 4: Analytics & Lead capture */}
          <div className="bento-card bento-card--wide">
            <div className="bento-icon bento-icon--green">
              <BarChart3 size={24} />
            </div>
            <div className="flex-1">
              <h3>Statistiques détaillées & Capture de contacts</h3>
              <p>
                Mesurez le nombre de scans, de consultations et d'ajouts au carnet d'adresses.
                Permettez à vos interlocuteurs de vous renvoyer leurs coordonnées en 1 clic.
              </p>
            </div>
            <button type="button" className="btn-secondary" onClick={onOpenDashboard}>
              <span>Voir le Dashboard</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Templates Showcase Carousel */}
      <section className="landing-section">
        <div className="section-title-wrap">
          <p className="eyebrow">Collection de Templates</p>
          <h2>Une sélection pensée pour l'impact visuel</h2>
          <p className="section-desc">
            Chaque modèle est entièrement réactif et personnalisable en temps réel.
          </p>
        </div>

        <div className="showcase-grid">
          {showcaseTemplates.map((t) => (
            <div className="showcase-card" key={t.id}>
              <div className="showcase-card__preview">
                <CardRenderer template={t} data={data} compact />
              </div>
              <div className="showcase-card__meta">
                <div>
                  <span className="template-cat">{t.category}</span>
                  <h4>{t.name}</h4>
                  <p>{t.description}</p>
                </div>
                <button type="button" className="btn-text" onClick={onOpenStudio}>
                  Utiliser <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section landing-section--steps">
        <div className="section-title-wrap">
          <p className="eyebrow">Simplicité & Rapidité</p>
          <h2>Comment ça marche ?</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Créez votre profil</h3>
            <p>
              Remplissez vos informations, importez votre photo et logo, ou laissez l'IA optimiser
              vos couleurs.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Partagez sans limite</h3>
            <p>
              Utilisez votre QR Code dynamique, votre lien personnalisé ou votre carte physique NFC.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Suivez et échangez</h3>
            <p>
              Recevez les coordonnées de vos contacts directement dans votre tableau de bord dédié.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-glow" />
        <h2>Prêt à sublimer votre identité professionnelle ?</h2>
        <p>Rejoignez les dirigeants et créateurs qui ont choisi Vantaj CardLink.</p>
        <button type="button" className="btn-hero-primary" onClick={onOpenStudio}>
          <Sparkles size={18} />
          <span>Accéder au Studio Vantaj</span>
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <p>© 2026 Vantaj CardLink. Tous droits réservés.</p>
          <div className="footer-links">
            <button type="button" onClick={onOpenStudio}>Studio</button>
            <button type="button" onClick={onOpenPublicView}>Profil Public</button>
            <button type="button" onClick={onOpenDashboard}>Dashboard</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
