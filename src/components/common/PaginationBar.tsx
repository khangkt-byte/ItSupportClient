import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  page,
  totalPages,
  totalCount,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}: PaginationBarProps) {
  if (totalPages < 1) return null;

  return (
    <div className="card p-4 flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page <span className="font-medium">{page}</span> of{' '}
        <span className="font-medium">{totalPages}</span> ({' '}
        <span className="font-medium">{totalCount}</span> total items)
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className="flex items-center gap-1 px-3 py-2 border border-input rounded-lg bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <input
          type="number"
          min="1"
          max={totalPages}
          value={page}
          onChange={(e) => {
            const nextPage = Math.min(
              Math.max(1, parseInt(e.target.value, 10) || 1),
              totalPages
            );
            onPageChange(nextPage);
          }}
          className="w-12 px-2 py-2 border border-input rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card text-foreground"
          aria-label="Go to page"
        />

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="flex items-center gap-1 px-3 py-2 border border-input rounded-lg bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
