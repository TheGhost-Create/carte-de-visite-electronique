import {
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Eye,
  Plus,
  Radio,
  Share2,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { TemplateDefinition, VirtualCardData } from "../../types/card";
import {
  deleteStoredLead,
  loadStoredAnalytics,
  loadStoredLeads,
  loadStoredSavedCards,
  type CapturedLead,
} from "../../services/cardStorage";
import { CardRenderer } from "../cards/CardRenderer";
import { copyShareLink } from "../../services/cardExport";
import { downloadBlob } from "../../utils/imageFiles";
import { templateRegistry } from "../../templates/templateRegistry";

type DashboardViewProps = {
  data: VirtualCardData;
  template: TemplateDefinition;
  onEditCard: (templateId?: string) => void;
  onSelectSavedCard?: (cardData: VirtualCardData, templateId: string) => void;
};

export function DashboardView({
  data,
  template,
  onEditCard,
  onSelectSavedCard,
}: DashboardViewProps) {
  const [analytics] = useState(() => loadStoredAnalytics());
  const [leads, setLeads] = useState<CapturedLead[]>(() => loadStoredLeads());
  const [savedCards] = useState(() => loadStoredSavedCards());
  const [toastMessage, setToastMessage] = useState("");
  const [selectedLead, setSelectedLead] = useState<CapturedLead | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCopyLink = async () => {
    const res = await copyShareLink(data);
    showToast(res);
  };

  const handleDeleteLead = (id: string) => {
    deleteStoredLead(id);
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    if (selectedLead?.id === id) {
      setSelectedLead(null);
    }
    showToast("Contact supprimé.");
  };

  const handleExportCsv = () => {
    if (leads.length === 0) {
      showToast("Aucun contact à exporter.");
      return;
    }

    const headers = ["Nom", "Email", "Telephone", "Entreprise", "Note", "Date"];
    const rows = leads.map((lead) => [
      `"${lead.fullName.replace(/"/g, '""')}"`,
      `"${lead.email.replace(/"/g, '""')}"`,
      `"${(lead.phone || "").replace(/"/g, '""')}"`,
      `"${(lead.company || "").replace(/"/g, '""')}"`,
      `"${(lead.note || "").replace(/"/g, '""')}"`,
      `"${new Date(lead.createdAt).toLocaleDateString("fr-FR")}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, `cardlink-contacts-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast("Fichier CSV téléchargé.");
  };

  const conversionRate =
    analytics.views > 0
      ? (((analytics.contactSaves + analytics.leadsCount) / analytics.views) * 100).toFixed(1)
      : "0";

  return (
    <div className="dashboard-page">
      {toastMessage && (
        <div className="toast-notification" role="status">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dashboard Top Header */}
      <header className="dashboard-header">
        <div>
          <div className="dashboard-pill">
            <Radio size={14} className="text-primary animate-pulse" />
            <span>Tableau de bord Vantaj CardLink</span>
          </div>
          <h1>Performance & Contacts</h1>
          <p>Suivez les scans, contacts enregistrés et interactions NFC en temps réel.</p>
        </div>

        <div className="dashboard-header__actions">
          <button type="button" className="btn-secondary" onClick={handleCopyLink}>
            <Copy size={16} />
            <span>Copier le lien public</span>
          </button>
          <button type="button" className="btn-primary" onClick={() => onEditCard()}>
            <Sparkles size={16} />
            <span>Modifier la carte active</span>
          </button>
        </div>
      </header>

      {/* KPI Metrics Grid */}
      <section className="dashboard-kpi-grid" aria-label="Statistiques clés">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Vues totales</span>
            <div className="kpi-icon">
              <Eye size={18} />
            </div>
          </div>
          <div className="kpi-value">{analytics.views.toLocaleString()}</div>
          <div className="kpi-subtext">
            <span className="text-success">+18.4%</span> vs semaine passée
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Taps NFC</span>
            <div className="kpi-icon kpi-icon--nfc">
              <Radio size={18} />
            </div>
          </div>
          <div className="kpi-value">{analytics.nfcTaps.toLocaleString()}</div>
          <div className="kpi-subtext">
            <span className="text-success">+12.2%</span> via cartes physiques
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Ajouts aux contacts</span>
            <div className="kpi-icon kpi-icon--save">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="kpi-value">{analytics.contactSaves.toLocaleString()}</div>
          <div className="kpi-subtext">
            <span className="text-success">+24.0%</span> vCards téléchargées
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Taux de conversion</span>
            <div className="kpi-icon kpi-icon--rate">
              <BarChart3 size={18} />
            </div>
          </div>
          <div className="kpi-value">{conversionRate}%</div>
          <div className="kpi-subtext">
            <span className="text-success">{leads.length}</span> leads reçus
          </div>
        </div>
      </section>

      {/* Analytics Chart & Active Card Overview Section */}
      <div className="dashboard-grid-main">
        {/* Left: Activity Chart */}
        <section className="dashboard-panel chart-panel">
          <div className="panel-heading">
            <div>
              <h3>Activité hebdomadaire</h3>
              <p>Consultations et scans par jour</p>
            </div>
            <div className="chart-legend">
              <span className="legend-item legend-views">Vues</span>
              <span className="legend-item legend-taps">Taps NFC</span>
            </div>
          </div>

          <div className="bar-chart-container">
            {analytics.history.map((day) => {
              const maxVal = 300;
              const viewsHeight = Math.min((day.views / maxVal) * 100, 100);
              const tapsHeight = Math.min((day.taps / maxVal) * 100, 100);

              return (
                <div className="bar-chart-col" key={day.date}>
                  <div className="bar-group">
                    <div
                      className="bar-fill bar-fill--views"
                      style={{ height: `${viewsHeight}%` }}
                      title={`Vues: ${day.views}`}
                    />
                    <div
                      className="bar-fill bar-fill--taps"
                      style={{ height: `${tapsHeight}%` }}
                      title={`Taps NFC: ${day.taps}`}
                    />
                  </div>
                  <span className="bar-label">{day.date}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Active Card Live Snapshot */}
        <section className="dashboard-panel card-preview-panel">
          <div className="panel-heading">
            <div>
              <h3>Carte Active</h3>
              <p>{template.name} ({template.category})</p>
            </div>
            <button
              type="button"
              className="btn-text"
              onClick={() => onEditCard(template.id)}
            >
              Éditer <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="dashboard-card-preview-box">
            <CardRenderer template={template} data={data} compact />
          </div>

          <div className="dashboard-card-meta">
            <div className="meta-stat">
              <span>Template</span>
              <strong>{template.name}</strong>
            </div>
            <div className="meta-stat">
              <span>Statut</span>
              <strong className="status-live">En ligne (Actif)</strong>
            </div>
            <div className="meta-stat">
              <span>Lien</span>
              <strong>{data.website || "vantaj-cardlink.example"}</strong>
            </div>
          </div>
        </section>
      </div>

      {/* Saved Cards List */}
      <section className="dashboard-panel mt-6">
        <div className="panel-heading">
          <div>
            <h3>Mes Cartes & Profils</h3>
            <p>Gérez vos différentes cartes professionnelles ou événements</p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => onEditCard()}>
            <Plus size={15} />
            <span>Créer une nouvelle carte</span>
          </button>
        </div>

        <div className="saved-cards-grid">
          {savedCards.map((card) => {
            const cardTemplate =
              templateRegistry.find((t) => t.id === card.templateId) || template;
            const isCurrent = cardTemplate.id === template.id;

            return (
              <div
                key={card.id}
                className={`saved-card-tile ${isCurrent ? "is-active" : ""}`}
              >
                <div className="saved-card-header">
                  <div>
                    <h4>{card.name}</h4>
                    <span>Template {cardTemplate.name}</span>
                  </div>
                  {isCurrent && (
                    <span className="badge-primary">
                      <Check size={12} /> Active
                    </span>
                  )}
                </div>

                <div className="saved-card-thumbnail">
                  <CardRenderer template={cardTemplate} data={card.data} compact />
                </div>

                <div className="saved-card-actions">
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      onSelectSavedCard?.(card.data, card.templateId);
                      showToast(`Carte "${card.name}" activée.`);
                    }}
                  >
                    Activer
                  </button>
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={() => {
                      onSelectSavedCard?.(card.data, card.templateId);
                      onEditCard(card.templateId);
                    }}
                  >
                    Modifier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Captured Leads Table */}
      <section className="dashboard-panel mt-6">
        <div className="panel-heading">
          <div>
            <h3>Contacts & Leads Collectés ({leads.length})</h3>
            <p>Personnes ayant échangé leurs coordonnées depuis votre carte digitale</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportCsv}
              disabled={leads.length === 0}
            >
              <Download size={15} />
              <span>Exporter en CSV</span>
            </button>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="empty-leads-box">
            <Users size={32} className="text-muted" />
            <h4>Aucun lead capturé pour le moment</h4>
            <p>
              Partagez votre QR Code ou activez votre carte NFC pour commencer à recevoir des
              coordonnées.
            </p>
          </div>
        ) : (
          <div className="leads-table-container">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Nom & Contact</th>
                  <th>Entreprise</th>
                  <th>Téléphone</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="lead-identity">
                        <strong>{lead.fullName}</strong>
                        <span>{lead.email}</span>
                      </div>
                    </td>
                    <td>{lead.company || "-"}</td>
                    <td>{lead.phone || "-"}</td>
                    <td>{new Date(lead.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="lead-note-col" title={lead.note || ""}>
                      {lead.note ? lead.note.slice(0, 45) + (lead.note.length > 45 ? "..." : "") : "-"}
                    </td>
                    <td>
                      <div className="table-actions">
                        <a
                          href={`mailto:${lead.email}`}
                          className="btn-icon"
                          title="Envoyer un email"
                        >
                          <CreditCard size={15} />
                        </a>
                        <button
                          type="button"
                          className="btn-icon text-danger"
                          onClick={() => handleDeleteLead(lead.id)}
                          title="Supprimer ce lead"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
