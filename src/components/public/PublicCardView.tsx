import {
  Building2,
  CheckCircle2,
  Copy,
  Download,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Send,
  Share2,
  Sparkles,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import type { TemplateDefinition, VirtualCardData } from "../../types/card";
import { CardRenderer } from "../cards/CardRenderer";
import { CardQRCode } from "../cards/CardQRCode";
import { copyShareLink, downloadVCard, shareCard } from "../../services/cardExport";
import { saveStoredLead } from "../../services/cardStorage";
import { getFullName } from "../cards/cardUtils";

type PublicCardViewProps = {
  data: VirtualCardData;
  template: TemplateDefinition;
  onOpenStudio?: () => void;
};

export function PublicCardView({ data, template, onOpenStudio }: PublicCardViewProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [notification, setNotification] = useState("");
  const [leadSaved, setLeadSaved] = useState(false);

  // Form state for lead capture
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadNote, setLeadNote] = useState("");

  const fullName = getFullName(data) || "Vantaj CardLink";

  const handleShare = async () => {
    const res = await shareCard(data);
    setNotification(res);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleCopy = async () => {
    const res = await copyShareLink(data);
    setNotification(res);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleSaveContact = () => {
    downloadVCard(data);
    setNotification("Fichier vCard téléchargé. Enregistrez-le dans vos contacts.");
    setTimeout(() => setNotification(""), 4000);
  };

  const handleLeadSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    saveStoredLead({
      fullName: leadName,
      email: leadEmail,
      phone: leadPhone,
      company: leadCompany,
      note: leadNote,
    });

    setLeadSaved(true);
    setTimeout(() => {
      setShowLeadModal(false);
      setLeadSaved(false);
      setLeadName("");
      setLeadEmail("");
      setLeadPhone("");
      setLeadCompany("");
      setLeadNote("");
      setNotification("Vos coordonnées ont été transmises avec succès !");
      setTimeout(() => setNotification(""), 3500);
    }, 1200);
  };

  return (
    <div className="public-card-page">
      {notification && (
        <div className="toast-notification" role="status">
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Top bar */}
      <header className="public-header">
        <div className="public-header__brand">
          <span className="live-pulse" />
          <span>Carte de visite en direct</span>
        </div>
        <div className="public-header__actions">
          <button type="button" className="btn-secondary" onClick={() => setShowQrModal(true)}>
            <QrCode size={16} />
            <span>QR Code</span>
          </button>
          <button type="button" className="btn-secondary" onClick={handleShare}>
            <Share2 size={16} />
            <span>Partager</span>
          </button>
          {onOpenStudio && (
            <button type="button" className="btn-primary" onClick={onOpenStudio}>
              <Sparkles size={16} />
              <span>Créer la mienne</span>
            </button>
          )}
        </div>
      </header>

      {/* Main card presentation container */}
      <main className="public-container">
        <div className="public-card-wrapper">
          <div className="public-card-glow" />
          <CardRenderer template={template} data={data} />
        </div>

        {/* Primary Contact Action Button */}
        <div className="public-primary-action">
          <button type="button" className="btn-save-contact" onClick={handleSaveContact}>
            <UserPlus size={18} />
            <span>Enregistrer dans mes contacts</span>
          </button>
          <button
            type="button"
            className="btn-exchange-contact"
            onClick={() => setShowLeadModal(true)}
          >
            <UserCheck size={18} />
            <span>Échanger mes coordonnées</span>
          </button>
        </div>

        {/* Quick Contact Buttons Grid */}
        <section className="public-quick-actions" aria-label="Actions rapides de contact">
          {data.phone && (
            <a href={`tel:${data.phone.replace(/\s/g, "")}`} className="quick-action-item">
              <div className="quick-action-icon">
                <Phone size={18} />
              </div>
              <span className="quick-action-label">Appeler</span>
              <span className="quick-action-value">{data.phone}</span>
            </a>
          )}

          {data.whatsapp && (
            <a
              href={`https://wa.me/${data.whatsapp.replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="quick-action-item"
            >
              <div className="quick-action-icon quick-action-icon--whatsapp">
                <MessageCircle size={18} />
              </div>
              <span className="quick-action-label">WhatsApp</span>
              <span className="quick-action-value">Message direct</span>
            </a>
          )}

          {data.email && (
            <a href={`mailto:${data.email}`} className="quick-action-item">
              <div className="quick-action-icon">
                <Mail size={18} />
              </div>
              <span className="quick-action-label">Email</span>
              <span className="quick-action-value">{data.email}</span>
            </a>
          )}

          {data.website && (
            <a href={data.website} target="_blank" rel="noreferrer" className="quick-action-item">
              <div className="quick-action-icon">
                <Globe2 size={18} />
              </div>
              <span className="quick-action-label">Site Web</span>
              <span className="quick-action-value">
                {data.website.replace(/^https?:\/\//, "")}
              </span>
            </a>
          )}
        </section>

        {/* Bio & Details Section */}
        {(data.bio || data.company || data.address) && (
          <section className="public-details-card">
            <h3>À propos</h3>
            {data.bio && <p className="public-bio">{data.bio}</p>}

            <div className="public-info-list">
              {data.company && (
                <div className="public-info-row">
                  <Building2 size={16} />
                  <span>{data.company}</span>
                </div>
              )}
              {data.address && (
                <div className="public-info-row">
                  <MapPin size={16} />
                  <span>{data.address}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Social Links */}
        {data.socials && Object.values(data.socials).some(Boolean) && (
          <section className="public-socials-card">
            <h3>Réseaux & Plateformes</h3>
            <div className="public-social-grid">
              {data.socials.linkedin && (
                <a
                  href={data.socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="social-badge"
                >
                  <span>LinkedIn</span>
                </a>
              )}
              {data.socials.instagram && (
                <a
                  href={data.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="social-badge"
                >
                  <span>Instagram</span>
                </a>
              )}
              {data.socials.twitter && (
                <a
                  href={data.socials.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="social-badge"
                >
                  <span>X (Twitter)</span>
                </a>
              )}
              {data.socials.youtube && (
                <a
                  href={data.socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="social-badge"
                >
                  <span>YouTube</span>
                </a>
              )}
              {data.socials.facebook && (
                <a
                  href={data.socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="social-badge"
                >
                  <span>Facebook</span>
                </a>
              )}
              {data.socials.tiktok && (
                <a
                  href={data.socials.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="social-badge"
                >
                  <span>TikTok</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Secondary share/copy buttons */}
        <div className="public-secondary-actions">
          <button type="button" className="btn-utility" onClick={handleCopy}>
            <Copy size={15} />
            <span>Copier le lien</span>
          </button>
          <button type="button" className="btn-utility" onClick={handleSaveContact}>
            <Download size={15} />
            <span>Télécharger vCard</span>
          </button>
        </div>

        {/* Public Footer */}
        <footer className="public-footer">
          <p>
            Alimenté par <strong>Vantaj CardLink</strong> • Identité numérique NFC & QR
          </p>
        </footer>
      </main>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>QR Code de contact</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowQrModal(false)}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </header>
            <div className="modal-qr-body">
              <div className="modal-qr-container">
                <CardQRCode
                  value={data.qrCodeUrl || data.website || window.location.href}
                  size={240}
                  tone="dark"
                />
              </div>
              <p className="modal-qr-hint">
                Scannez ce QR Code avec l'appareil photo d'un smartphone pour ouvrir directement
                cette carte.
              </p>
              <div className="modal-qr-name">
                <strong>{fullName}</strong>
                {data.jobTitle && <span>{data.jobTitle}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Exchange Modal */}
      {showLeadModal && (
        <div className="modal-backdrop" onClick={() => setShowLeadModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h3>Échanger mes coordonnées</h3>
                <p>Envoyez vos informations à {fullName}</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowLeadModal(false)}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </header>

            {leadSaved ? (
              <div className="modal-success-state">
                <CheckCircle2 size={48} className="text-success" />
                <h4>Coordonnées transmises !</h4>
                <p>{fullName} a bien reçu votre fiche de contact.</p>
              </div>
            ) : (
              <form className="modal-lead-form" onSubmit={handleLeadSubmit}>
                <label>
                  <span>Nom complet *</span>
                  <input
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Ex: Jean Dupont"
                  />
                </label>
                <label>
                  <span>Email professionnel *</span>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="Ex: jean.dupont@entreprise.com"
                  />
                </label>
                <label>
                  <span>Numéro de téléphone</span>
                  <input
                    type="tel"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="Ex: +33 6 12 34 56 78"
                  />
                </label>
                <label>
                  <span>Entreprise</span>
                  <input
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder="Ex: Acme Corp"
                  />
                </label>
                <label>
                  <span>Note ou message</span>
                  <input
                    value={leadNote}
                    onChange={(e) => setLeadNote(e.target.value)}
                    placeholder="Ex: Suite à notre échange lors du salon..."
                  />
                </label>

                <button type="submit" className="btn-primary w-full mt-2">
                  <Send size={16} />
                  <span>Envoyer mes informations</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
