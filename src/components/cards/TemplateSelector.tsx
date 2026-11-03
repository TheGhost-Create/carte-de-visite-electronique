import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { TemplateCategory, TemplateDefinition, VirtualCardData } from "../../types/card";
import { CardRenderer } from "./CardRenderer";

type TemplateSelectorProps = {
  templates: TemplateDefinition[];
  selectedId: string;
  data: VirtualCardData;
  onSelect: (templateId: string) => void;
};

const categories: Array<"All" | TemplateCategory> = [
  "All",
  "Luxury",
  "Corporate",
  "Minimal",
  "Technology",
  "Signature",
];

export function TemplateSelector({
  templates,
  selectedId,
  data,
  onSelect,
}: TemplateSelectorProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");

  const visibleTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesCategory = category === "All" || template.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        template.name.toLowerCase().includes(normalizedQuery) ||
        template.description.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, templates]);

  return (
    <section className="template-selector" aria-labelledby="template-selector-title">
      <div className="section-heading">
        <div>
          <p>Template Gallery</p>
          <h2 id="template-selector-title">15 premium card systems</h2>
        </div>
        <label className="template-search">
          <Search aria-hidden="true" size={16} />
          <span className="sr-only">Search templates</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search template"
            type="search"
          />
        </label>
      </div>

      <div className="category-tabs" aria-label="Template categories">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="template-grid">
        {visibleTemplates.map((template) => {
          const isSelected = template.id === selectedId;
          return (
            <button
              key={template.id}
              type="button"
              className="template-tile"
              onClick={() => onSelect(template.id)}
              aria-pressed={isSelected}
            >
              <div className="template-tile__preview">
                <CardRenderer template={template} data={data} compact />
              </div>
              <div className="template-tile__meta">
                <div>
                  <span>{template.category}</span>
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                </div>
                <span className="template-tile__check" aria-hidden="true">
                  {isSelected && <Check size={16} />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
