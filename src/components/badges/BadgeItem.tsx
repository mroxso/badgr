import { Badge as BadgeType } from '@/lib/types/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';

interface BadgeItemProps {
  badge: BadgeType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIssuer?: boolean;
  onClick?: () => void;
}

export function BadgeItem({
  badge,
  className,
  size = 'md',
  showIssuer = true,
  onClick,
}: BadgeItemProps) {
  const issuer = useAuthor(badge.issuerPubkey);
  const metadata = issuer.data?.metadata;
  const issuerName = metadata?.name || genUserName(badge.issuerPubkey);
  
  const dimensions = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };
  
  return (
    <div 
      className={cn(
        'flex flex-col items-center p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors',
        className,
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <Avatar className={cn('rounded-md overflow-hidden', dimensions[size])}>
        <AvatarImage src={badge.thumb || badge.image} alt={badge.name || 'Badge'} />
        <AvatarFallback className="text-xs">{badge.name?.substring(0, 2) || 'BG'}</AvatarFallback>
      </Avatar>
      
      <div className="mt-2 text-center space-y-1">
        <h4 className="font-medium text-sm line-clamp-1">{badge.name || 'Unnamed Badge'}</h4>
        
        {showIssuer && (
          <Badge variant="outline" className="text-xs truncate max-w-full">
            by {issuerName}
          </Badge>
        )}
      </div>
    </div>
  );
}