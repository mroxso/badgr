import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeLayout } from '@/components/badges/BadgeLayout';
import { BadgeGrid } from '@/components/badges/BadgeGrid';
import { useBadgeDefinitions } from '@/hooks/useBadges';
import { Badge } from '@/lib/types/badge';
import { processBadgeDefinition } from '@/lib/badge-utils';
import { Badge as UiBadge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RelaySelector } from '@/components/RelaySelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon } from 'lucide-react';

export function BadgeExplorer() {
  const { data: badgeDefinitions = [], isLoading } = useBadgeDefinitions();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const navigate = useNavigate();

  // Process badge definitions into Badge objects
  const badges = badgeDefinitions.map((def) => {
    const badge = processBadgeDefinition(def);
    return {
      ...badge,
      issuerPubkey: def.pubkey,
      definitionId: def.id,
      id: def.id,
    } as Badge;
  });

  // Filter badges based on search term
  const filteredBadges = badges.filter((badge) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (badge.name?.toLowerCase().includes(searchLower) || false) ||
      (badge.description?.toLowerCase().includes(searchLower) || false) ||
      badge.issuerPubkey.toLowerCase().includes(searchLower) ||
      badge.badgeId.toLowerCase().includes(searchLower)
    );
  });

  // Sort badges based on selected option
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return (b.definitionId ? parseInt(b.definitionId.slice(0, 8), 16) : 0) - 
               (a.definitionId ? parseInt(a.definitionId.slice(0, 8), 16) : 0);
      case 'oldest':
        return (a.definitionId ? parseInt(a.definitionId.slice(0, 8), 16) : 0) - 
               (b.definitionId ? parseInt(b.definitionId.slice(0, 8), 16) : 0);
      case 'alphabetical':
        return (a.name || '').localeCompare(b.name || '');
      default:
        return 0;
    }
  });

  const handleBadgeClick = (badge: Badge) => {
    navigate(`/badges/${badge.id}`);
  };

  const emptyState = (
    <Card className="border-dashed">
      <CardContent className="py-12 px-8 text-center">
        <div className="max-w-sm mx-auto space-y-6">
          <h3 className="text-lg font-medium">No badges found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "No badges match your search criteria."
              : "There are no badges available on this relay. Try another relay?"}
          </p>
          <RelaySelector className="w-full" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <BadgeLayout title="Explore Badges" description="Discover and explore Nostr badges">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold">Explore Badges</h1>
          <div className="flex justify-end gap-2">
            <UiBadge variant="outline" className="hidden md:flex">
              {badgeDefinitions.length} badges available
            </UiBadge>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search badges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex-none w-full sm:w-48">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <BadgeGrid
          badges={sortedBadges}
          onBadgeClick={handleBadgeClick}
          isLoading={isLoading}
          emptyState={emptyState}
        />
      </div>
    </BadgeLayout>
  );
}

export default BadgeExplorer;