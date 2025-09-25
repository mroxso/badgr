import { Badge } from '@/lib/types/badge';
import { BadgeItem } from '@/components/badges/BadgeItem';
import { cn } from '@/lib/utils';

interface BadgeGridProps {
  badges: Badge[];
  className?: string;
  onBadgeClick?: (badge: Badge) => void;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  badgeSize?: 'sm' | 'md' | 'lg';
  showIssuer?: boolean;
}

export function BadgeGrid({
  badges,
  className,
  onBadgeClick,
  emptyState,
  isLoading,
  badgeSize = 'md',
  showIssuer = true,
}: BadgeGridProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4', className)}>
        {Array(10).fill(0).map((_, i) => (
          <div key={i} className="flex flex-col items-center p-2 animate-pulse">
            <div className={cn('rounded-md bg-muted', badgeSize === 'sm' ? 'w-12 h-12' : badgeSize === 'md' ? 'w-16 h-16' : 'w-24 h-24')} />
            <div className="mt-2 w-16 h-3 bg-muted rounded" />
            {showIssuer && <div className="mt-1 w-12 h-2 bg-muted rounded" />}
          </div>
        ))}
      </div>
    );
  }

  if (badges.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4', className)}>
      {badges.map((badge) => (
        <BadgeItem
          key={badge.id}
          badge={badge}
          size={badgeSize}
          showIssuer={showIssuer}
          onClick={onBadgeClick ? () => onBadgeClick(badge) : undefined}
        />
      ))}
    </div>
  );
}