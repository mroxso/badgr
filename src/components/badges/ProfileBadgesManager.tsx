import { useUserBadges } from '@/hooks/useBadges';
import { useUpdateProfileBadges } from '@/hooks/useBadgeActions';
import { useToast } from '@/hooks/useToast';
import { UserBadge } from '@/lib/types/badge';
import { createATagIdentifier, extractBadgeReferences } from '@/lib/badge-utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProfileBadges } from '@/hooks/useBadges';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Star, StarOff, ArrowUp, ArrowDown, X, Check } from 'lucide-react';
import { useCallback, useState } from 'react';

export function ProfileBadgesManager() {
  const { user } = useCurrentUser();
  const userBadges = useUserBadges();
  const { data: profileBadges } = useProfileBadges();
  const { toast } = useToast();
  const { mutate: updateProfileBadges, isPending } = useUpdateProfileBadges();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  
  // Initialize badges when userBadges changes
  useState(() => {
    if (userBadges) {
      setBadges(userBadges);
    }
  });
  
  const handleAccept = (badge: UserBadge) => {
    if (!user || !badge.awardEventId) return;
    
    // Create new badge array with this badge accepted
    const newBadges = [...badges];
    const badgeIndex = newBadges.findIndex(b => b.id === badge.id);
    
    if (badgeIndex >= 0) {
      newBadges[badgeIndex] = {
        ...newBadges[badgeIndex],
        accepted: true,
      };
      
      // Put accepted badges first
      const maxOrder = Math.max(0, ...newBadges.filter(b => b.accepted).map(b => b.order));
      newBadges[badgeIndex].order = maxOrder + 1;
      
      setBadges(newBadges);
      saveBadges(newBadges);
    }
  };
  
  const handleReject = (badge: UserBadge) => {
    if (!user) return;
    
    // Create new badge array with this badge rejected
    const newBadges = [...badges];
    const badgeIndex = newBadges.findIndex(b => b.id === badge.id);
    
    if (badgeIndex >= 0) {
      newBadges[badgeIndex] = {
        ...newBadges[badgeIndex],
        accepted: false,
      };
      
      setBadges(newBadges);
      saveBadges(newBadges);
    }
  };
  
  const handleMoveUp = (badge: UserBadge) => {
    if (!user || !badge.accepted) return;
    
    const acceptedBadges = badges.filter(b => b.accepted);
    const badgeIndex = acceptedBadges.findIndex(b => b.id === badge.id);
    
    if (badgeIndex > 0) {
      // Swap with previous badge
      const newBadges = [...badges];
      const badgeToMoveIndex = newBadges.findIndex(b => b.id === badge.id);
      const prevBadgeIndex = newBadges.findIndex(b => b.id === acceptedBadges[badgeIndex - 1].id);
      
      // Swap orders
      const tempOrder = newBadges[badgeToMoveIndex].order;
      newBadges[badgeToMoveIndex].order = newBadges[prevBadgeIndex].order;
      newBadges[prevBadgeIndex].order = tempOrder;
      
      setBadges([...newBadges].sort((a, b) => {
        if (a.accepted && b.accepted) return a.order - b.order;
        if (a.accepted) return -1;
        if (b.accepted) return 1;
        return (b.issuedAt || 0) - (a.issuedAt || 0);
      }));
      saveBadges(newBadges);
    }
  };
  
  const handleMoveDown = (badge: UserBadge) => {
    if (!user || !badge.accepted) return;
    
    const acceptedBadges = badges.filter(b => b.accepted);
    const badgeIndex = acceptedBadges.findIndex(b => b.id === badge.id);
    
    if (badgeIndex < acceptedBadges.length - 1) {
      // Swap with next badge
      const newBadges = [...badges];
      const badgeToMoveIndex = newBadges.findIndex(b => b.id === badge.id);
      const nextBadgeIndex = newBadges.findIndex(b => b.id === acceptedBadges[badgeIndex + 1].id);
      
      // Swap orders
      const tempOrder = newBadges[badgeToMoveIndex].order;
      newBadges[badgeToMoveIndex].order = newBadges[nextBadgeIndex].order;
      newBadges[nextBadgeIndex].order = tempOrder;
      
      setBadges([...newBadges].sort((a, b) => {
        if (a.accepted && b.accepted) return a.order - b.order;
        if (a.accepted) return -1;
        if (b.accepted) return 1;
        return (b.issuedAt || 0) - (a.issuedAt || 0);
      }));
      saveBadges(newBadges);
    }
  };
  
  const saveBadges = useCallback((badgesToSave: UserBadge[]) => {
    if (!user) return;
    
    // Create badge references from accepted badges
    const badgeRefs = badgesToSave
      .filter(badge => badge.accepted && badge.awardEventId)
      .sort((a, b) => a.order - b.order)
      .map(badge => {
        const aTag = createATagIdentifier(30009, badge.issuerPubkey, badge.badgeId);
        return {
          aTag,
          eTag: badge.awardEventId!,
        };
      });
    
    updateProfileBadges({ badgeRefs }, {
      onSuccess: () => {
        toast({
          title: 'Badges updated',
          description: 'Your badge collection has been updated',
        });
      },
      onError: () => {
        toast({
          title: 'Update failed',
          description: 'Failed to update your badge collection',
          variant: 'destructive',
        });
      },
    });
  }, [user, updateProfileBadges, toast]);
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Badges</CardTitle>
          <CardDescription>You must be logged in to manage your badges</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (!userBadges || userBadges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Badges</CardTitle>
          <CardDescription>You haven't been awarded any badges yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Badges</CardTitle>
        <CardDescription>Manage the badges that appear on your profile</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <div className="text-sm font-medium">Accepted Badges</div>
          {badges.filter(b => b.accepted).length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No badges accepted yet
            </div>
          ) : (
            badges
              .filter(b => b.accepted)
              .map((badge, index) => (
                <div
                  key={badge.id}
                  className="flex items-center justify-between border p-3 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 rounded-md">
                      <AvatarImage src={badge.thumb || badge.image} alt={badge.name || 'Badge'} />
                      <AvatarFallback>{badge.name?.substring(0, 2) || 'BG'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{badge.name || 'Unnamed Badge'}</div>
                      <div className="text-xs text-muted-foreground">
                        Order: {index + 1}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleMoveUp(badge)}
                      disabled={index === 0 || isPending}
                    >
                      <ArrowUp className="h-4 w-4" />
                      <span className="sr-only">Move up</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleMoveDown(badge)}
                      disabled={index === badges.filter(b => b.accepted).length - 1 || isPending}
                    >
                      <ArrowDown className="h-4 w-4" />
                      <span className="sr-only">Move down</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleReject(badge)}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              ))
          )}
        </div>
        
        {badges.filter(b => !b.accepted).length > 0 && (
          <div className="grid gap-2 mt-6">
            <div className="text-sm font-medium">Available Badges</div>
            {badges
              .filter(b => !b.accepted)
              .map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center justify-between border p-3 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 rounded-md">
                      <AvatarImage src={badge.thumb || badge.image} alt={badge.name || 'Badge'} />
                      <AvatarFallback>{badge.name?.substring(0, 2) || 'BG'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{badge.name || 'Unnamed Badge'}</div>
                      {badge.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {badge.description}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleAccept(badge)}
                    disabled={isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                </div>
              ))}
          </div>
        )}
        
        {isPending && (
          <div className="flex justify-center pt-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}