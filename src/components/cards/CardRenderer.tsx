import type { CSSProperties } from "react";
import type { TemplateDefinition, VirtualCardData } from "../../types/card";

type CardRendererProps = {
  template: TemplateDefinition;
  data: VirtualCardData;
  compact?: boolean;
};

export function CardRenderer({ template, data, compact = false }: CardRendererProps) {
  const Template = template.component;
  const style = {
    "--card-primary": template.palette.primary,
    "--card-secondary": template.palette.secondary,
    "--card-surface": template.palette.surface,
    "--card-text": template.palette.text,
    "--card-muted": template.palette.muted,
    "--card-metallic": template.palette.metallic,
  } as CSSProperties;

  return (
    <div className="card-renderer" data-template={template.id} style={style}>
      <Template data={data} compact={compact} />
    </div>
  );
}
