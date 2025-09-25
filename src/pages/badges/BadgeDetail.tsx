import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BadgeLayout } from '@/components/badges/BadgeLayout';
import { useBadgeDefinition, useBadgeAward } from '@/hooks/useBadges';
import { BadgeView } from '@/components/badges/BadgeView';
import { BadgeAwardForm } from '@/components/badges/BadgeAwardForm';
import { Badge as BadgeType } from '@/lib/types/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Award, ChevronLeft, Users } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { getTagValue, combineBadgeInfo } from '@/lib/badge-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RelaySelector } from '@/components/RelaySelector';

export function BadgeDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: badgeDefinition, isLoading, error } = useBadgeDefinition(id);
  const { user } = useCurrentUser();
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
  
  const badge: BadgeType | null = badgeDefinition
    ? {
        ...combineBadgeInfo(badgeDefinition),
        id: badgeDefinition.id,
      }
    : null;
  
  const issuer = useAuthor(badge?.issuerPubkey || '');
  const issuerMetadata = issuer.data?.metadata;
  const issuerName = issuerMetadata?.name || (badge?.issuerPubkey ? genUserName(badge.issuerPubkey) : 'Unknown');
  
  if (isLoading) {
    return (
      <BadgeLayout title="Loading Badge" description="Loading badge details">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-8 w-40" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Skeleton className="w-48 h-48 rounded-lg" />
              <Skeleton className="h-4 w-40 mt-4" />
            </CardContent>
          </Card>
        </div>
      </BadgeLayout>
    );
  }
  
  if (error || !badge) {
    return (
      <BadgeLayout title="Badge Not Found" description="Badge not found">
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Badge Not Found</AlertTitle>
            <AlertDescription>
              The badge you're looking for wasn't found. It may not exist or is not available on your current relay.
            </AlertDescription>
          </Alert>
          
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <div className="max-w-sm mx-auto space-y-4">
                <p className="text-muted-foreground">Try switching to another relay:</p>
                <RelaySelector className="w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </BadgeLayout>
    );
  }
  
  const canAward = user && user.pubkey === badge.issuerPubkey;
  const badgeName = badge.name || 'Unnamed Badge';
  
  return (
    <BadgeLayout title={badgeName} description={badge.description}>
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{badgeName}</CardTitle>
                    <CardDescription>Badge ID: {badge.badgeId}</CardDescription>
                  </div>
                  <Badge variant="outline">{badgeDefinition?.kind === 30009 ? 'Definition' : 'Unknown'}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-48 h-48 relative">
                    <Avatar className="w-full h-full rounded-lg">
                      <AvatarImage 
                        src={badge.image || badge.thumb} 
                        alt={badgeName} 
                        className="object-contain"
                      />
                      <AvatarFallback className="text-4xl">
                        {badgeName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                {badge.description && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">{badge.description}</p>
                  </div>
                )}
              </CardContent>
              
              {canAward && (
                <CardFooter className="flex justify-end">
                  <Button onClick={() => setIsAwardDialogOpen(true)}>
                    <Award className="h-4 w-4 mr-2" />
                    Award this Badge
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            {/* Could add additional sections like badge statistics here */}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Issuer</CardTitle>
              </CardHeader>
              <CardContent>
                <Link 
                  to={`/npub1${badge.issuerPubkey}`} 
                  className="flex items-center gap-3 hover:bg-accent p-2 rounded-md transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={issuerMetadata?.picture} alt={issuerName} />
                    <AvatarFallback>{issuerName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{issuerName}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {issuerMetadata?.nip05 || `npub1${badge.issuerPubkey.substring(0, 8)}...`}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Badge Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Created</div>
                  <div className="font-medium">
                    {badgeDefinition && new Date(badgeDefinition.created_at * 1000).toLocaleDateString()}
                  </div>
                  
                  <div className="text-muted-foreground">Badge ID</div>
                  <div className="font-medium truncate">{badge.badgeId}</div>
                  
                  {badge.image && (
                    <>
                      <div className="text-muted-foreground">Image</div>
                      <div className="font-medium">
                        <a 
                          href={badge.image} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {badgeDefinition && (
        <BadgeAwardForm
          badge={badgeDefinition}
          isOpen={isAwardDialogOpen}
          onClose={() => setIsAwardDialogOpen(false)}
        />
      )}
    </BadgeLayout>
  );
}

export default BadgeDetail;