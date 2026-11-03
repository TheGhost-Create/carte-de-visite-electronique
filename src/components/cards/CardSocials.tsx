import type { VirtualCardData } from "../../types/card";
import { ensureHttps, socialMeta } from "./cardUtils";

type CardSocialsProps = {
  data: VirtualCardData;
  compact?: boolean;
};

export function CardSocials({ data, compact = false }: CardSocialsProps) {
  const socials = Object.entries(data.socials ?? {}).filter(([, value]) => Boolean(value));

  if (socials.length === 0) {
    return null;
  }

  return (
    <div className={`card-socials ${compact ? "card-socials--compact" : ""}`}>
      {socials.map(([platform, value]) => {
        const meta = socialMeta[platform as keyof typeof socialMeta];
        const Icon = meta.icon;

        return (
          <a
            key={platform}
            href={ensureHttps(value as string)}
            aria-label={meta.label}
            title={meta.label}
          >
            <Icon aria-hidden="true" size={compact ? 13 : 15} strokeWidth={1.8} />
            {!compact && <span>{meta.short}</span>}
          </a>
        );
      })}
    </div>
  );
}
