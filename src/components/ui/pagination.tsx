// components/ui/pagination.tsx
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Précédent
      </Button>
      <span className="text-sm">{`Page ${page} sur ${totalPages}`}</span>
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        Suivant
      </Button>
    </div>
  );
}
