import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeLayout } from '@/components/badges/BadgeLayout';
import { useUserBadges } from '@/hooks/useBadges';
import { UserBadge } from '@/lib/types/badge';
import { ProfileBadgesManager } from '@/components/badges/ProfileBadgesManager';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { BadgeGrid } from '@/components/badges/BadgeGrid';
import { BadgeView } from '@/components/badges/BadgeView';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BadgeCheck } from 'lucide-react';

export function MyBadges() {
  const { user } = useCurrentUser();
  const userBadges = useUserBadges();
  const userProfile = useAuthor(user?.pubkey || '');
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  
  const acceptedBadges = userBadges.filter(badge => badge.accepted);
  const pendingBadges = userBadges.filter(badge => !badge.accepted);
  
  const handleBadgeClick = (badge: UserBadge) => {
    navigate(`/badges/${badge.definitionId}`);
  };
  
  const emptyState = (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <BadgeCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Badges Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          You haven't received any badges yet. Participate in the Nostr community to earn badges from other users.
        </p>
        <Button onClick={() => navigate('/badges')}>
          Explore Badges
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <BadgeLayout title="My Badges" description="Manage your Nostr badges collection">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <h1 className="text-3xl font-bold">My Badges</h1>
          {user && (
            <Badge variant="outline" className="hidden sm:flex">
              {acceptedBadges.length} badges in profile
            </Badge>
          )}
        </div>
        
        {!user && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not logged in</AlertTitle>
            <AlertDescription>
              Please log in to view and manage your badges.
            </AlertDescription>
          </Alert>
        )}
        
        {user && (
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile Badges</TabsTrigger>
              <TabsTrigger value="all">All Badges</TabsTrigger>
              <TabsTrigger value="manage">Manage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="py-4">
              {acceptedBadges.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <BadgeCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Profile Badges</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      You haven't added any badges to your profile. Check your available badges and accept them to display on your profile.
                    </p>
                    <Button onClick={() => setActiveTab('manage')}>
                      Manage Badges
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    These badges are displayed on your public profile.
                  </p>
                  <BadgeGrid
                    badges={acceptedBadges}
                    onBadgeClick={handleBadgeClick}
                    badgeSize="md"
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all" className="py-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">All Your Badges</h2>
                  {userBadges.length > 0 && (
                    <Badge variant="outline">{userBadges.length} total badges</Badge>
                  )}
                </div>
                
                <BadgeGrid
                  badges={userBadges}
                  onBadgeClick={handleBadgeClick}
                  emptyState={emptyState}
                  badgeSize="md"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="manage" className="py-4">
              <ProfileBadgesManager />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </BadgeLayout>
  );
}

export default MyBadges;