import type { VirtualCardData } from "../../types/card";
import { getContactItems } from "./cardUtils";

type CardContactProps = {
  data: VirtualCardData;
  limit?: number;
  compact?: boolean;
};

export function CardContact({ data, limit = 4, compact = false }: CardContactProps) {
  const items = getContactItems(data).slice(0, limit);

  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={`card-contact ${compact ? "card-contact--compact" : ""}`}>
      {items.map(({ key, label, value, href, icon: Icon }) => {
        const content = (
          <>
            <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
            <span>{value}</span>
          </>
        );

        return (
          <li key={key}>
            {href ? (
              <a href={href} aria-label={`${label}: ${value}`}>
                {content}
              </a>
            ) : (
              <span aria-label={`${label}: ${value}`}>{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
