import QRCodeGenerator from "qrcode";
import type { TemplateDefinition, VirtualCardData } from "../types/card";
import { downloadBlob } from "../utils/imageFiles";
import { getEffectiveQrCodePayload, getFullName, getInitials } from "../components/cards/cardUtils";

// Standard print card dimensions (ratio 85mm x 55mm at 300+ DPI equivalent)
export const printExportWidth = 2040;
export const printExportHeight = 1280;

export type CardSide = "front" | "back";

/**
 * Download high-resolution PNG for a specific side (front or back)
 */
export async function downloadCardPng(
  data: VirtualCardData,
  template: TemplateDefinition,
  side: CardSide = "front",
  includeCropMarks = false,
) {
  const canvas = await renderExportCanvas(data, template, side, includeCropMarks);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));

  if (!blob) {
    throw new Error("Impossible de générer le PNG haute résolution.");
  }

  const suffix = side === "front" ? "recto" : "verso";
  downloadBlob(blob, `${filenameBase(data)}-${template.id}-${suffix}.png`);
}

/**
 * Generate Data URL for live previewing in modals
 */
export async function getCardSideDataUrl(
  data: VirtualCardData,
  template: TemplateDefinition,
  side: CardSide = "front",
  includeCropMarks = false,
): Promise<string> {
  const canvas = await renderExportCanvas(data, template, side, includeCropMarks);
  return canvas.toDataURL("image/png");
}

/**
 * Download the complete print package (Recto PNG + Verso PNG + Technical Print Sheet)
 */
export async function downloadPrintPackage(
  data: VirtualCardData,
  template: TemplateDefinition,
) {
  // 1. Download Recto
  await downloadCardPng(data, template, "front", true);

  // 2. Short pause then download Verso
  await new Promise((resolve) => setTimeout(resolve, 400));
  await downloadCardPng(data, template, "back", true);

  // 3. Technical specification sheet for printer
  const fullName = getFullName(data) || "Vantaj CardLink";
  const printSpecs = `=====================================================
FICHE TECHNIQUE D'IMPRESSION - VANTAJ CARDLINK
=====================================================
Client : ${fullName}
Entreprise : ${data.company || "N/A"}
Template : ${template.name} (${template.category})
Date de génération : ${new Date().toLocaleDateString("fr-FR")}

SPÉCIFICATIONS D'IMPRESSION RECOMMANDÉES :
-----------------------------------------------------
- Format fini : 85 mm x 55 mm (ou 85.6 mm x 53.98 mm format carte bancaire ISO 7810 ID-1)
- Résolution : 300 DPI / Haute Définition
- Espace colorimétrique : CMJN / RGB 24-bit
- Fond perdu (Bleed) : 2 mm inclus avec traits de coupe
- Zone de sécurité interne : 3 mm des bords

RECOMMANDATIONS MATÉRIAUX :
-----------------------------------------------------
1. Version Papier / Cartonné :
   - Papier 350g/m² ou 400g/m² couché mat ou Soft Touch
   - Option vernis sélectif 3D ou dorure à chaud sur le logo

2. Version PVC / Carte Connectée NFC (Recommandé) :
   - Support PVC blanc ou noir mat 0.76mm
   - Puce NFC intégrée : NTAG213 ou NTAG216 (13.56 MHz)
   - Programmation URL NFC : ${data.qrCodeUrl || data.website || window.location.href}
   - Finition : Mat anti-rayures

FICHIERS FOURNIS DANS CE PACK :
-----------------------------------------------------
1. ${filenameBase(data)}-${template.id}-recto.png (Face avant)
2. ${filenameBase(data)}-${template.id}-verso.png (Face arrière avec QR Code & zone NFC)

Généré par Vantaj CardLink Studio.
=====================================================`;

  const specsBlob = new Blob([printSpecs], { type: "text/plain;charset=utf-8" });
  await new Promise((resolve) => setTimeout(resolve, 400));
  downloadBlob(specsBlob, `${filenameBase(data)}-fiche-imprimeur.txt`);
}

/**
 * Open a complete print-ready PDF window with Front and Back side-by-side or on 2 pages
 */
export async function printCardPdf(
  data: VirtualCardData,
  template: TemplateDefinition,
  mode: "both" | "front" | "back" = "both",
) {
  const frontCanvas = await renderExportCanvas(data, template, "front", true);
  const backCanvas = await renderExportCanvas(data, template, "back", true);

  const frontSource = frontCanvas.toDataURL("image/png");
  const backSource = backCanvas.toDataURL("image/png");
  const fullName = escapeHtml(getFullName(data) || "Vantaj CardLink");

  const printWindow = window.open("", "_blank", "width=1100,height=850");

  if (!printWindow) {
    throw new Error("La fenêtre d'impression a été bloquée par le navigateur. Veuillez autoriser les fenêtres pop-up.");
  }

  printWindow.document.write(`<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Planche d'Impression - ${fullName} - Vantaj CardLink</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 16px;
    }
    .print-header {
      text-align: center;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e2e8f0;
    }
    .print-header h1 {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .print-header p {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .print-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 24px;
      margin: 0 auto;
      max-width: 1000px;
    }
    .card-print-box {
      flex: 1;
      max-width: 480px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 14px;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    }
    .card-print-box h2 {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .card-print-img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 8px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    }
    .card-print-meta {
      margin-top: 8px;
      font-size: 11px;
      color: #64748b;
    }
    .print-instructions {
      margin: 20px auto 0 auto;
      max-width: 980px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 18px;
      font-size: 11px;
      color: #475569;
      line-height: 1.5;
    }
    .print-instructions strong {
      color: #0f172a;
    }
    .print-actions {
      text-align: center;
      margin-top: 16px;
    }
    .btn-print {
      display: inline-block;
      padding: 10px 24px;
      background: #0f172a;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      border-radius: 8px;
      text-decoration: none;
      cursor: pointer;
      border: none;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .print-actions { display: none; }
      .print-instructions { border: 1px solid #ccc; }
      .card-print-box { box-shadow: none; border: 1px solid #ddd; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <h1>Planche d'Impression Haute Résolution • ${fullName}</h1>
    <p>Format Standard Business Card 85 x 55 mm • 300 DPI • Template : ${escapeHtml(template.name)}</p>
  </div>

  <div class="print-container">
    ${
      mode === "both" || mode === "front"
        ? `<div class="card-print-box">
            <h2>Recto (Face Avant)</h2>
            <img class="card-print-img" src="${frontSource}" alt="Recto de la carte">
            <p class="card-print-meta">Format fini : 85 x 55 mm • Traits de coupe inclus</p>
          </div>`
        : ""
    }

    ${
      mode === "both" || mode === "back"
        ? `<div class="card-print-box">
            <h2>Verso (Face Arrière • QR & NFC)</h2>
            <img class="card-print-img" src="${backSource}" alt="Verso de la carte">
            <p class="card-print-meta">QR Code vectoriel & Repères sans contact NFC</p>
          </div>`
        : ""
    }
  </div>

  <div class="print-instructions">
    <strong>Instructions pour l'imprimeur / Atelier :</strong>
    Format fini 85 x 55 mm (ou 85.6 x 53.98 mm). Fond perdu 2 mm inclus avec traits de coupe.
    Papier conseillé : Couché mat 350g/400g ou support rigide PVC NFC avec puce NTAG213/NTAG216 encodée sur l'URL de profil.
  </div>

  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">Lancer l'impression / Enregistrer en PDF</button>
  </div>

  <script>
    window.onload = function () {
      setTimeout(function () {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`);
  printWindow.document.close();
}

/**
 * Generate vCard 3.0 file
 */
export function downloadVCard(data: VirtualCardData) {
  const fullName = getFullName(data);
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(data.lastName)};${escapeVCard(data.firstName)};;;`,
    `FN:${escapeVCard(fullName)}`,
    data.company && `ORG:${escapeVCard(data.company)}`,
    data.jobTitle && `TITLE:${escapeVCard(data.jobTitle)}`,
    data.phone && `TEL;TYPE=CELL:${escapeVCard(data.phone)}`,
    data.whatsapp && `TEL;TYPE=WHATSAPP:${escapeVCard(data.whatsapp)}`,
    data.email && `EMAIL:${escapeVCard(data.email)}`,
    data.website && `URL:${escapeVCard(data.website)}`,
    data.address && `ADR;TYPE=WORK:;;${escapeVCard(data.address)};;;;`,
    (data.tagline || data.bio) && `NOTE:${escapeVCard([data.tagline, data.bio].filter(Boolean).join("\\n"))}`,
    "END:VCARD",
  ].filter(Boolean);

  downloadBlob(new Blob([lines.join("\n")], { type: "text/vcard;charset=utf-8" }), `${filenameBase(data)}.vcf`);
}

/**
 * Share card via Web Share API or copy link
 */
export async function shareCard(data: VirtualCardData) {
  const title = getFullName(data) || "Vantaj CardLink";
  const url = data.qrCodeUrl || data.website || window.location.href;
  const text = data.tagline || data.jobTitle || "Carte de visite numérique Vantaj CardLink";

  if (typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url });
      return "Partage ouvert.";
    } catch {
      // User cancelled or share failed, fallback to clipboard
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
    return "Lien de partage copié dans le presse-papier.";
  }
  return "Partage non disponible sur ce navigateur.";
}

export async function copyShareLink(data: VirtualCardData) {
  const url = data.qrCodeUrl || data.website || window.location.href;
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(url);
    return "Lien copié dans le presse-papier.";
  }
  return "Presse-papier non disponible.";
}

/**
 * Internal 2D Canvas Engine rendering 300 DPI print-ready card graphics for Front or Back
 */
async function renderExportCanvas(
  data: VirtualCardData,
  template: TemplateDefinition,
  side: CardSide = "front",
  includeCropMarks = false,
) {
  const canvas = document.createElement("canvas");
  canvas.width = printExportWidth;
  canvas.height = printExportHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D indisponible.");
  }

  const palette = template.palette;

  // 1. Background Gradient
  const gradient = ctx.createLinearGradient(0, 0, printExportWidth, printExportHeight);
  gradient.addColorStop(0, palette.surface);
  gradient.addColorStop(0.55, palette.secondary);
  gradient.addColorStop(1, palette.primary);
  ctx.fillStyle = gradient;
  roundedRect(ctx, 0, 0, printExportWidth, printExportHeight, 64);
  ctx.fill();

  // 2. Metallic Geometry Pattern
  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.strokeStyle = palette.metallic;
  ctx.lineWidth = 5;
  for (let x = -500; x < printExportWidth + 300; x += 180) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 750, printExportHeight);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Subtle depth overlays
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  roundedRect(ctx, printExportWidth - 650, -200, 800, 750, 150);
  ctx.fill();
  ctx.restore();

  if (side === "front") {
    // ==========================================
    // FRONT SIDE RENDERING
    // ==========================================
    await drawLogoOrMark(ctx, data, template);

    if (data.profileImage) {
      await drawProfileImage(ctx, data);
    }

    // Full Name
    ctx.fillStyle = palette.text;
    ctx.font = "800 100px Inter, Arial, sans-serif";
    wrapText(ctx, getFullName(data) || "Vantaj CardLink", 140, 480, 1150, 110, 2);

    // Job Title
    ctx.font = "600 48px Inter, Arial, sans-serif";
    ctx.fillStyle = palette.text;
    if (data.jobTitle) {
      ctx.fillText(data.jobTitle, 144, 620);
    }

    // Company
    ctx.font = "500 38px Inter, Arial, sans-serif";
    ctx.fillStyle = palette.muted;
    if (data.company) {
      ctx.fillText(data.company, 144, 680);
    }

    // Tagline / Bio
    if (data.tagline) {
      ctx.font = "400 34px Inter, Arial, sans-serif";
      wrapText(ctx, data.tagline, 144, 760, 1100, 48, 2);
    }

    // Contact lines
    drawContactLines(ctx, data, template);

    // Bottom Branding
    ctx.font = "600 24px Inter, Arial, sans-serif";
    ctx.fillStyle = palette.muted;
    ctx.fillText("VANTAJ CARDLINK • SMART IDENTITY", 144, printExportHeight - 80);
  } else {
    // ==========================================
    // BACK SIDE RENDERING (QR Code + NFC Connect)
    // ==========================================

    // Header Logo & Branding
    await drawLogoOrMark(ctx, data, template);

    ctx.fillStyle = palette.text;
    ctx.font = "800 82px Inter, Arial, sans-serif";
    ctx.fillText("Vantaj CardLink", 140, 420);

    ctx.font = "600 44px Inter, Arial, sans-serif";
    ctx.fillStyle = palette.muted;
    ctx.fillText("Carte de visite connectée sans contact", 144, 490);

    // NFC Instructions & Visual Icon
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    roundedRect(ctx, 140, 580, 780, 260, 36);
    ctx.fill();

    // Draw NFC Contactless Waves
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(230, 710, 35, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(230, 710, 60, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(230, 710, 85, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    ctx.fillStyle = palette.text;
    ctx.font = "700 40px Inter, Arial, sans-serif";
    ctx.fillText("Technologie NFC", 350, 690);

    ctx.font = "400 28px Inter, Arial, sans-serif";
    ctx.fillStyle = palette.muted;
    ctx.fillText("Approchez votre smartphone ici", 350, 740);
    ctx.fillText("pour enregistrer la fiche de contact.", 350, 780);
    ctx.restore();

    // Large high-contrast QR Code on the right
    await drawQr(ctx, data, template);

    // Footer note
    ctx.font = "500 26px Inter, Arial, sans-serif";
    ctx.fillStyle = palette.muted;
    ctx.fillText("Compatible 100% iOS & Android sans application", 144, printExportHeight - 80);
  }

  // Draw Printer Crop Marks if requested
  if (includeCropMarks) {
    drawCropMarks(ctx, printExportWidth, printExportHeight);
  }

  return canvas;
}

function drawCropMarks(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const markLen = 40;
  const inset = 30;

  ctx.save();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.85;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(inset, inset - markLen);
  ctx.lineTo(inset, inset);
  ctx.lineTo(inset - markLen, inset);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(width - inset, inset - markLen);
  ctx.lineTo(width - inset, inset);
  ctx.lineTo(width - inset + markLen, inset);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(inset, height - inset + markLen);
  ctx.lineTo(inset, height - inset);
  ctx.lineTo(inset - markLen, height - inset);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(width - inset, height - inset + markLen);
  ctx.lineTo(width - inset, height - inset);
  ctx.lineTo(width - inset + markLen, height - inset);
  ctx.stroke();

  ctx.restore();
}

async function drawLogoOrMark(
  ctx: CanvasRenderingContext2D,
  data: VirtualCardData,
  template: TemplateDefinition,
) {
  const logo = data.logo && canDrawImage(data.logo) ? await loadImage(data.logo).catch(() => null) : null;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  roundedRect(ctx, 140, 110, 290, 140, 32);
  ctx.fill();

  if (logo) {
    drawImageContain(ctx, logo, 160, 130, 250, 100);
  } else {
    ctx.fillStyle = template.palette.surface;
    ctx.font = "800 58px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(getInitials(data), 285, 202);
    ctx.textAlign = "left";
  }
  ctx.restore();
}

async function drawProfileImage(ctx: CanvasRenderingContext2D, data: VirtualCardData) {
  if (!data.profileImage || !canDrawImage(data.profileImage)) {
    return;
  }

  const image = await loadImage(data.profileImage).catch(() => null);
  if (!image) {
    return;
  }

  const size = 320;
  const x = printExportWidth - size - 140;
  const y = 110;

  ctx.save();
  roundedRect(ctx, x, y, size, size, 54);
  ctx.clip();
  drawImageCover(ctx, image, x, y, size, size);
  ctx.restore();

  // Outer ring border
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 8;
  roundedRect(ctx, x, y, size, size, 54);
  ctx.stroke();
  ctx.restore();
}

function drawContactLines(
  ctx: CanvasRenderingContext2D,
  data: VirtualCardData,
  template: TemplateDefinition,
) {
  const contacts = [
    data.phone && `Tél : ${data.phone}`,
    data.email && `Email : ${data.email}`,
    data.website && `Web : ${data.website.replace(/^https?:\/\//, "")}`,
    data.address && `Lieu : ${data.address}`,
  ].filter(Boolean) as string[];

  ctx.font = "500 34px Inter, Arial, sans-serif";
  ctx.fillStyle = template.palette.text;

  contacts.slice(0, 4).forEach((contact, index) => {
    ctx.globalAlpha = 0.95 - index * 0.08;
    ctx.fillText(contact, 144, 940 + index * 52);
  });

  ctx.globalAlpha = 1;
}

async function drawQr(
  ctx: CanvasRenderingContext2D,
  data: VirtualCardData,
  template: TemplateDefinition,
) {
  const qrValue = getEffectiveQrCodePayload(data);
  const qrSize = 460;
  const x = printExportWidth - qrSize - 140;
  const y = 440;

  const qrSource = await QRCodeGenerator.toDataURL(qrValue, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 600,
    color: {
      dark: "#07111f",
      light: "#ffffff",
    },
  });

  const image = await loadImage(qrSource);

  ctx.save();
  ctx.fillStyle = "#ffffff";
  roundedRect(ctx, x - 26, y - 26, qrSize + 52, qrSize + 52, 44);
  ctx.fill();

  ctx.drawImage(image, x, y, qrSize, qrSize);

  // Label under QR
  ctx.fillStyle = "#07111f";
  ctx.font = "700 24px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SCANNEZ LE PROFIL", x + qrSize / 2, y + qrSize + 16);
  ctx.textAlign = "left";

  ctx.restore();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image illisible."));
    image.src = src;
  });
}

function canDrawImage(src: string) {
  return src.startsWith("data:") || src.startsWith("/") || src.startsWith(window.location.origin) || src.startsWith("http");
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const ratio = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const ratio = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      line = word;
      lines += 1;
      if (lines >= maxLines) {
        return;
      }
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) {
    ctx.fillText(line, x, y + lines * lineHeight);
  }
}

function filenameBase(data: VirtualCardData) {
  return (getFullName(data) || "vantaj-card")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeVCard(value = "") {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}
