import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Layers,
  Package,
  Printer,
  QrCode,
  Radio,
  Share2,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import type { TemplateDefinition, VirtualCardData } from "../../types/card";
import {
  copyShareLink,
  downloadCardPng,
  downloadPrintPackage,
  downloadVCard,
  getCardSideDataUrl,
  printCardPdf,
  shareCard,
  type CardSide,
} from "../../services/cardExport";

type ExportPanelProps = {
  data: VirtualCardData;
  template: TemplateDefinition;
  hasViewed3DPreview: boolean;
  hasValidated3D: boolean;
  onOpen3DPreview: () => void;
  onValidate3D: () => void;
};

export function ExportPanel({
  data,
  template,
  hasViewed3DPreview,
  hasValidated3D,
  onOpen3DPreview,
  onValidate3D,
}: ExportPanelProps) {
  const [message, setMessage] = useState("");
  const [busyAction, setBusyAction] = useState<string>("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [previewFrontUrl, setPreviewFrontUrl] = useState<string>("");
  const [previewBackUrl, setPreviewBackUrl] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  const openPrintPreview = async () => {
    setLoadingPreview(true);
    setShowPrintModal(true);
    try {
      const front = await getCardSideDataUrl(data, template, "front", true);
      const back = await getCardSideDataUrl(data, template, "back", true);
      setPreviewFrontUrl(front);
      setPreviewBackUrl(back);
    } catch {
      setMessage("Erreur lors de la génération de l'aperçu.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownloadPng = async (side: CardSide) => {
    setBusyAction(`png-${side}`);
    setMessage("");
    try {
      await downloadCardPng(data, template, side, true);
      setMessage(`Image ${side === "front" ? "Recto" : "Verso"} 300 DPI générée avec succès.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur d'exportation.");
    } finally {
      setBusyAction("");
    }
  };

  const handleDownloadPackage = async () => {
    setBusyAction("package");
    setMessage("");
    try {
      await downloadPrintPackage(data, template);
      setMessage("Pack Imprimeur complet téléchargé (Recto + Verso + Fiche technique d'impression).");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur d'exportation.");
    } finally {
      setBusyAction("");
    }
  };

  const handlePrintPdf = async (mode: "both" | "front" | "back" = "both") => {
    setBusyAction("pdf");
    setMessage("");
    try {
      await printCardPdf(data, template, mode);
      setMessage("Fenêtre d'impression ouverte. Prêt pour l'impression ou l'enregistrement PDF.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur d'impression.");
    } finally {
      setBusyAction("");
    }
  };

  const handleVCard = () => {
    downloadVCard(data);
    setMessage("Fichier vCard (.vcf) généré. Prêt à être importé sur smartphone.");
  };

  const handleShare = async () => {
    try {
      const res = await shareCard(data);
      setMessage(res);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur de partage.");
    }
  };

  const handleCopy = async () => {
    try {
      const res = await copyShareLink(data);
      setMessage(res);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur de copie.");
    }
  };

  return (
    <section className="export-panel" aria-labelledby="export-panel-title">
      <div className="section-heading">
        <div>
          <p>Export & Impression Physique</p>
          <h2 id="export-panel-title">Finaliser & Imprimer ma carte</h2>
        </div>
        <span>{hasValidated3D ? "Exports Haute Résolution Disponibles" : "Preview 3D Recommandée"}</span>
      </div>

      {/* Workflow Steps Indicator */}
      <div className="export-flow">
        <div className="export-validation">
          <div className="export-steps" aria-label="Progression export">
            <span className={hasViewed3DPreview ? "is-complete" : ""}>
              <Eye aria-hidden="true" size={15} />
              Preview 3D
            </span>
            <span className={hasValidated3D ? "is-complete" : ""}>
              <CheckCircle2 aria-hidden="true" size={15} />
              Validation
            </span>
            <span className={hasValidated3D ? "is-complete" : ""}>
              <Printer aria-hidden="true" size={15} />
              Impression & Partage
            </span>
          </div>

          {!hasViewed3DPreview ? (
            <button type="button" className="export-primary" onClick={onOpen3DPreview}>
              <Eye aria-hidden="true" size={16} />
              Voir ma carte en 3D
            </button>
          ) : !hasValidated3D ? (
            <button type="button" className="export-primary" onClick={onValidate3D}>
              <CheckCircle2 aria-hidden="true" size={16} />
              Valider ma carte
            </button>
          ) : (
            <div className="export-ready">
              <CheckCircle2 aria-hidden="true" size={18} />
              Carte validée • Fichiers 300 DPI prêts pour l'imprimeur
            </div>
          )}
        </div>

        {/* PRINT SPECIFIC SECTION */}
        <div className="print-hub-container">
          <div className="print-hub-header">
            <div className="flex items-center gap-2">
              <Printer size={18} className="text-primary" />
              <h3>Impression Physique & Puce NFC (300 DPI)</h3>
            </div>
            <button
              type="button"
              className="btn-preview-print"
              onClick={openPrintPreview}
              title="Prévisualiser le Recto et le Verso"
            >
              <Layers size={14} />
              <span>Aperçu avant impression</span>
            </button>
          </div>

          <p className="print-hub-desc">
            Exportez les fichiers prêts à l'emploi au format standard 85 x 55 mm avec traits de
            coupe (crop marks) et fond perdu de 2 mm, prêts pour n'importe quel imprimeur ou
            fabricant de cartes NFC.
          </p>

          <div className="print-actions-grid">
            {/* Action 1: Complete Print PDF Sheet */}
            <button
              type="button"
              className="print-card-btn print-card-btn--primary"
              onClick={() => handlePrintPdf("both")}
              disabled={busyAction === "pdf"}
            >
              <div className="btn-icon-wrap">
                <FileText size={20} />
              </div>
              <div className="text-left">
                <strong>Planche Imprimeur PDF (Recto + Verso)</strong>
                <span>Format A4 / 85x55mm • Fiche technique & traits de coupe</span>
              </div>
            </button>

            {/* Action 2: Complete Pack (ZIP/Bundle) */}
            <button
              type="button"
              className="print-card-btn"
              onClick={handleDownloadPackage}
              disabled={busyAction === "package"}
            >
              <div className="btn-icon-wrap">
                <Package size={20} />
              </div>
              <div className="text-left">
                <strong>Pack Imprimeur Complet (300 DPI)</strong>
                <span>PNG Recto HD + PNG Verso HD + Fiche spécifications</span>
              </div>
            </button>

            {/* Action 3: Front PNG */}
            <button
              type="button"
              className="print-card-btn"
              onClick={() => handleDownloadPng("front")}
              disabled={busyAction === "png-front"}
            >
              <div className="btn-icon-wrap">
                <Download size={18} />
              </div>
              <div className="text-left">
                <strong>Télécharger Recto (Face Avant)</strong>
                <span>PNG HD 300 DPI • Identité, Logo & Coordonnées</span>
              </div>
            </button>

            {/* Action 4: Back PNG with QR & NFC */}
            <button
              type="button"
              className="print-card-btn"
              onClick={() => handleDownloadPng("back")}
              disabled={busyAction === "png-back"}
            >
              <div className="btn-icon-wrap">
                <QrCode size={18} />
              </div>
              <div className="text-left">
                <strong>Télécharger Verso (QR Code & NFC)</strong>
                <span>PNG HD 300 DPI • QR Code vectoriel & zone sans contact</span>
              </div>
            </button>
          </div>
        </div>

        {/* DIGITAL & SHARING ACTIONS */}
        <div className="digital-export-section">
          <h4>Partage Numérique & Carnet d'Adresses</h4>
          <div className="export-actions">
            <button type="button" onClick={handleVCard}>
              <UserPlus aria-hidden="true" size={15} />
              vCard (.vcf)
            </button>
            <button type="button" onClick={handleShare}>
              <Share2 aria-hidden="true" size={15} />
              Partager la carte
            </button>
            <button type="button" onClick={handleCopy}>
              <Copy aria-hidden="true" size={15} />
              Copier le lien public
            </button>
          </div>
        </div>
      </div>

      {message && <p className="form-message">{message}</p>}

      {/* MODAL: PRINT PREVIEW (RECTO / VERSO) */}
      {showPrintModal && (
        <div className="modal-backdrop" onClick={() => setShowPrintModal(false)}>
          <div className="modal-card modal-card--wide" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h3>Aperçu Avant Impression • 85 x 55 mm</h3>
                <p>Vérifiez le rendu du Recto et du Verso avant transmission à votre imprimeur</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowPrintModal(false)}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </header>

            {loadingPreview ? (
              <div className="modal-loading-box">
                <Sparkles size={28} className="animate-spin text-primary" />
                <p>Génération de l'aperçu 300 DPI en cours...</p>
              </div>
            ) : (
              <div className="print-preview-modal-body">
                <div className="print-preview-dual-grid">
                  {/* Front Preview */}
                  <div className="print-face-preview">
                    <div className="print-face-tag">Face Avant (Recto)</div>
                    <div className="print-face-frame">
                      {previewFrontUrl ? (
                        <img src={previewFrontUrl} alt="Aperçu Recto" />
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted">Chargement...</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-secondary btn-sm w-full mt-2"
                      onClick={() => handleDownloadPng("front")}
                    >
                      <Download size={14} />
                      <span>Télécharger Recto (PNG 300 DPI)</span>
                    </button>
                  </div>

                  {/* Back Preview */}
                  <div className="print-face-preview">
                    <div className="print-face-tag">Face Arrière (Verso • QR & NFC)</div>
                    <div className="print-face-frame">
                      {previewBackUrl ? (
                        <img src={previewBackUrl} alt="Aperçu Verso" />
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted">Chargement...</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-secondary btn-sm w-full mt-2"
                      onClick={() => handleDownloadPng("back")}
                    >
                      <Download size={14} />
                      <span>Télécharger Verso (PNG 300 DPI)</span>
                    </button>
                  </div>
                </div>

                <div className="print-modal-instructions">
                  <FileCheck2 size={18} className="text-primary flex-shrink-0" />
                  <div>
                    <strong>Prêt pour impression :</strong> Résolution 300 DPI, repères de coupe
                    aux angles et fond perdu 2 mm inclus.
                  </div>
                </div>

                <div className="print-modal-footer">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setShowPrintModal(false);
                      handlePrintPdf("both");
                    }}
                  >
                    <Printer size={16} />
                    <span>Lancer l'impression / Exporter le PDF</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowPrintModal(false);
                      handleDownloadPackage();
                    }}
                  >
                    <Package size={16} />
                    <span>Télécharger le Pack Imprimeur complet</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
