import { Badge } from '@/lib/types/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface BadgeViewProps {
  badge: Badge;
  showAwardInfo?: boolean;
}

export function BadgeView({ badge, showAwardInfo = true }: BadgeViewProps) {
  const issuer = useAuthor(badge.issuerPubkey);
  const metadata = issuer.data?.metadata;
  const issuerName = metadata?.name || genUserName(badge.issuerPubkey);
  const issuerPicture = metadata?.picture;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={issuerPicture} alt={issuerName} />
            <AvatarFallback>{issuerName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">
              {badge.name || 'Unnamed Badge'}
            </CardTitle>
            <CardDescription className="text-xs">
              by <Link to={`/npub1${badge.issuerPubkey}`} className="hover:underline">{issuerName}</Link>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center pt-4">
        <div className="relative w-48 h-48 mb-4">
          <Avatar className="w-full h-full rounded-lg">
            <AvatarImage 
              src={badge.image || badge.thumb} 
              alt={badge.name || 'Badge'} 
              className="object-contain"
            />
            <AvatarFallback className="text-4xl">
              {badge.name?.substring(0, 2) || 'BG'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {badge.description && (
          <div className="text-center mb-4 text-sm">
            {badge.description}
          </div>
        )}
      </CardContent>
      
      {showAwardInfo && badge.issuedAt && (
        <CardFooter className="text-xs text-muted-foreground">
          Awarded {formatDistanceToNow(new Date(badge.issuedAt * 1000), { addSuffix: true })}
        </CardFooter>
      )}
    </Card>
  );
}