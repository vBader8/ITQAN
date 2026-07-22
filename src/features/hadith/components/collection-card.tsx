import { Link } from "@/i18n/navigation";
import { Card } from "@/design-system/components/card";
import type { Collection } from "@/features/hadith/types";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/hadith/${collection.slug}`}
      className="focus-visible:outline-ring block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Card className="hover:bg-secondary/50 flex items-center justify-between gap-4 p-4 transition-colors">
        <span className="font-medium">{collection.name}</span>
        <span className="font-arabic-sans text-foreground text-lg">
          {collection.nameArabic}
        </span>
      </Card>
    </Link>
  );
}
