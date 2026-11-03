import {
  Briefcase,
  Camera,
  Globe2,
  Image as ImageIcon,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import type { VirtualCardData } from "../../types/card";
import { readFileAsDataUrl, validateCardImageFile } from "../../utils/imageFiles";
import { getFullName, getInitials } from "./cardUtils";

type DataEditorProps = {
  data: VirtualCardData;
  onChange: (data: VirtualCardData) => void;
};

type FieldName = keyof Pick<
  VirtualCardData,
  | "firstName"
  | "lastName"
  | "jobTitle"
  | "company"
  | "tagline"
  | "bio"
  | "phone"
  | "whatsapp"
  | "email"
  | "website"
  | "address"
  | "qrCodeUrl"
>;

const fieldGroups = [
  {
    title: "Identity",
    icon: User,
    fields: [
      ["firstName", "First name"],
      ["lastName", "Last name"],
      ["jobTitle", "Role"],
      ["company", "Company"],
      ["tagline", "Tagline"],
      ["bio", "Bio"],
    ] as [FieldName, string][],
  },
  {
    title: "Contact",
    icon: Phone,
    fields: [
      ["phone", "Phone"],
      ["whatsapp", "WhatsApp"],
      ["email", "Email"],
      ["website", "Website"],
      ["address", "Address"],
      ["qrCodeUrl", "QR URL"],
    ] as [FieldName, string][],
  },
];

const socialFields = [
  ["linkedin", "LinkedIn"],
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["twitter", "X"],
  ["tiktok", "TikTok"],
  ["youtube", "YouTube"],
] as const;

type AssetField = "logo" | "profileImage";

export function DataEditor({ data, onChange }: DataEditorProps) {
  const [assetError, setAssetError] = useState("");

  const updateField = (field: FieldName) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [field]: event.target.value });
  };

  const updateSocial =
    (field: (typeof socialFields)[number][0]) => (event: ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...data,
        socials: {
          ...data.socials,
          [field]: event.target.value,
        },
      });
    };

  const updateImageAsset =
    (field: AssetField) => async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file) {
        return;
      }

      const validationError = validateCardImageFile(file);
      if (validationError) {
        setAssetError(validationError);
        return;
      }

      try {
        const source = await readFileAsDataUrl(file);
        setAssetError("");
        onChange({ ...data, [field]: source });
      } catch {
        setAssetError("Impossible de lire cette image.");
      }
    };

  const removeImageAsset = (field: AssetField) => {
    setAssetError("");
    onChange({ ...data, [field]: undefined });
  };

  const renderAssetControl = (
    field: AssetField,
    label: string,
    capture: "user" | "environment",
  ) => {
    const source = data[field];
    const isProfile = field === "profileImage";

    return (
      <div className="asset-field">
        <div className={`asset-preview ${source ? "has-image" : ""}`}>
          {source ? (
            <img src={source} alt={label} />
          ) : isProfile ? (
            <span>{getInitials(data)}</span>
          ) : (
            <ImageIcon aria-hidden="true" size={20} />
          )}
        </div>
        <div className="asset-field__body">
          <span>{label}</span>
          <div className="asset-actions">
            <label className="asset-button">
              <Upload aria-hidden="true" size={14} />
              Importer
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={updateImageAsset(field)}
              />
            </label>
            <label className="asset-button">
              <Camera aria-hidden="true" size={14} />
              Photo
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                capture={capture}
                onChange={updateImageAsset(field)}
              />
            </label>
            {source && (
              <button type="button" className="asset-button" onClick={() => removeImageAsset(field)}>
                <Trash2 aria-hidden="true" size={14} />
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="data-editor" aria-label="Card data editor">
      <div className="data-editor__intro">
        <p>Live Data</p>
        <h2>One source for every template</h2>
      </div>

      <section className="editor-group">
        <h3>
          <ImageIcon aria-hidden="true" size={15} />
          Assets
        </h3>
        <div className="asset-stack">
          {renderAssetControl("logo", "Logo", "environment")}
          {renderAssetControl("profileImage", `Photo - ${getFullName(data) || "profil"}`, "user")}
        </div>
        {assetError && <p className="form-message form-message--error">{assetError}</p>}
      </section>

      {fieldGroups.map((group) => {
        const Icon = group.icon;
        return (
          <section className="editor-group" key={group.title}>
            <h3>
              <Icon aria-hidden="true" size={15} />
              {group.title}
            </h3>
            <div className="editor-fields">
              {group.fields.map(([field, label]) => (
                <label key={field}>
                  <span>{label}</span>
                  <input value={data[field] ?? ""} onChange={updateField(field)} />
                </label>
              ))}
            </div>
          </section>
        );
      })}

      <section className="editor-group">
        <h3>
          <Link2 aria-hidden="true" size={15} />
          Socials
        </h3>
        <div className="editor-fields">
          {socialFields.map(([field, label]) => (
            <label key={field}>
              <span>{label}</span>
              <input value={data.socials?.[field] ?? ""} onChange={updateSocial(field)} />
            </label>
          ))}
        </div>
      </section>

      <section className="editor-group editor-group--compact" aria-label="Required interaction fields">
        <h3>
          <Briefcase aria-hidden="true" size={15} />
          Actions covered
        </h3>
        <div className="coverage-list">
          <span><Phone size={13} /> Call</span>
          <span><MessageCircle size={13} /> WhatsApp</span>
          <span><Mail size={13} /> Email</span>
          <span><Globe2 size={13} /> Website</span>
          <span><MapPin size={13} /> Location</span>
        </div>
      </section>
    </aside>
  );
}
