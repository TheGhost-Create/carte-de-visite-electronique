import type { VirtualCardData } from "../../types/card";
import { getFullName, getInitials } from "./cardUtils";

type CardIdentityProps = {
  data: VirtualCardData;
  align?: "left" | "center" | "right";
  showPhoto?: boolean;
  compact?: boolean;
};

export function CardIdentity({
  data,
  align = "left",
  showPhoto = true,
  compact = false,
}: CardIdentityProps) {
  return (
    <div className={`card-identity card-identity--${align} ${compact ? "is-compact" : ""}`}>
      {showPhoto && (
        <div className="card-avatar" aria-hidden={!data.profileImage}>
          {data.profileImage ? (
            <img src={data.profileImage} alt={`${getFullName(data)} portrait`} />
          ) : (
            <span>{getInitials(data)}</span>
          )}
        </div>
      )}
      <div className="card-identity__copy">
        <h3>{getFullName(data)}</h3>
        {data.jobTitle && <p className="card-role">{data.jobTitle}</p>}
        {data.company && <p className="card-company">{data.company}</p>}
        {data.tagline && <p className="card-tagline">{data.tagline}</p>}
      </div>
    </div>
  );
}
