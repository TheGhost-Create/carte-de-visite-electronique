import { Download, Mail, Phone, Share2, UserPlus } from "lucide-react";
import type { VirtualCardData } from "../../types/card";

type CardActionsProps = {
  data: VirtualCardData;
  compact?: boolean;
};

export function CardActions({ data, compact = false }: CardActionsProps) {
  const actions = [
    data.phone && {
      key: "call",
      label: "Call",
      href: `tel:${data.phone.replace(/\s/g, "")}`,
      icon: Phone,
    },
    data.email && {
      key: "email",
      label: "Email",
      href: `mailto:${data.email}`,
      icon: Mail,
    },
    {
      key: "contact",
      label: "Save",
      href: "#save-contact",
      icon: UserPlus,
    },
    {
      key: "share",
      label: "Share",
      href: "#share-card",
      icon: Share2,
    },
    {
      key: "download",
      label: "Export",
      href: "#download-card",
      icon: Download,
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    href: string;
    icon: typeof Phone;
  }[];

  return (
    <div className={`card-actions ${compact ? "card-actions--compact" : ""}`}>
      {actions.slice(0, compact ? 4 : 5).map(({ key, label, href, icon: Icon }) => (
        <a href={href} key={key} aria-label={label} title={label}>
          <Icon aria-hidden="true" size={compact ? 13 : 15} strokeWidth={1.8} />
          {!compact && <span>{label}</span>}
        </a>
      ))}
    </div>
  );
}
