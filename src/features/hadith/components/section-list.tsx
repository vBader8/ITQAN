import { Link } from "@/i18n/navigation";
import { Card } from "@/design-system/components/card";
import type { Section } from "@/features/hadith/types";

export function SectionList({
  book,
  sections,
}: {
  book: string;
  sections: Section[];
}) {
  return (
    <ul className="flex flex-col gap-2">
      {sections.map((section) => (
        <li key={section.number}>
          <Link
            href={`/hadith/${book}/${section.number}`}
            className="focus-visible:outline-ring block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Card className="hover:bg-secondary/50 flex items-center gap-3 p-4 transition-colors">
              <span className="bg-accent text-accent-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                {section.number}
              </span>
              <span className="font-medium">{section.name}</span>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
