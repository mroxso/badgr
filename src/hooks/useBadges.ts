import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@/hooks/useNostr';
import {
  BadgeDefinition,
  BadgeAward,
  ProfileBadges,
  Badge,
  UserBadge,
} from '@/lib/types/badge';
import {
  isValidBadgeDefinition,
  isValidBadgeAward,
  isValidProfileBadges,
  combineBadgeInfo,
  extractBadgeReferences,
  getTagValue,
  getAllTagValues,
  parseATagIdentifier,
} from '@/lib/badge-utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { NostrEvent } from '@nostrify/nostrify';

/**
 * Hook to fetch all badge definitions
 */
export function useBadgeDefinitions() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['badge-definitions'],
    queryFn: async ({ signal }) => {
      signal = AbortSignal.any([signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query([{ kinds: [30009], limit: 100 }], { signal });
      
      // Filter and validate badge definitions
      const badgeDefinitions = events.filter(isValidBadgeDefinition);
      
      return badgeDefinitions;
    },
  });
}

/**
 * Hook to fetch a specific badge definition by ID
 */
export function useBadgeDefinition(id: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['badge-definition', id],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      
      signal = AbortSignal.any([signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query([{ ids: [id], kinds: [30009] }], { signal });
      
      const definition = events.find(isValidBadgeDefinition);
      return definition || null;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch badges awarded to a specific user
 */
export function useUserAwardedBadges(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['user-awarded-badges', pubkey],
    queryFn: async ({ signal }) => {
      if (!pubkey) return [];
      
      signal = AbortSignal.any([signal, AbortSignal.timeout(3000)]);
      
      // Query badge awards where the pubkey is in the p tags
      const awardEvents = await nostr.query([{ 
        kinds: [8], 
        '#p': [pubkey],
        limit: 100,
      }], { signal });
      
      const awards = awardEvents.filter(isValidBadgeAward);
      
      // Get all badge definition references from awards
      const definitionRefs = awards
        .map(award => getTagValue(award, 'a'))
        .filter((ref): ref is string => !!ref)
        .map(aTag => {
          const parsed = parseATagIdentifier(aTag);
          return parsed && parsed.kind === 30009 ? parsed : null;
        })
        .filter((ref): ref is { kind: number; pubkey: string; identifier: string } => !!ref);
      
      // Query all referenced badge definitions
      const definitionEvents: NostrEvent[] = [];
      
      // Batch queries by issuer pubkey for efficiency
      const pubkeyGroups = definitionRefs.reduce((acc, ref) => {
        if (!acc[ref.pubkey]) {
          acc[ref.pubkey] = [];
        }
        acc[ref.pubkey].push(ref.identifier);
        return acc;
      }, {} as Record<string, string[]>);
      
      // Query definitions by issuer and d-tag
      for (const [pubkey, identifiers] of Object.entries(pubkeyGroups)) {
        const pubkeyDefinitions = await nostr.query([{
          kinds: [30009],
          authors: [pubkey],
          '#d': identifiers,
        }], { signal });
        
        definitionEvents.push(...pubkeyDefinitions);
      }
      
      const definitions = definitionEvents.filter(isValidBadgeDefinition);
      
      // Combine award and definition information into complete badge objects
      const badges: Badge[] = [];
      
      for (const award of awards) {
        const aTag = getTagValue(award, 'a');
        if (!aTag) continue;
        
        const parsed = parseATagIdentifier(aTag);
        if (!parsed) continue;
        
        const definition = definitions.find(def => 
          def.pubkey === parsed.pubkey && 
          getTagValue(def, 'd') === parsed.identifier
        );
        
        if (definition) {
          const badge = combineBadgeInfo(definition, award);
          badge.awardEventId = award.id;
          badges.push(badge);
        }
      }
      
      return badges;
    },
    enabled: !!pubkey,
  });
}

/**
 * Hook to fetch the current user's profile badges
 */
export function useProfileBadges() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  
  return useQuery({
    queryKey: ['profile-badges', user?.pubkey],
    queryFn: async ({ signal }) => {
      if (!user?.pubkey) return null;
      
      signal = AbortSignal.any([signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query([{ 
        kinds: [30008],
        authors: [user.pubkey],
        '#d': ['profile_badges'],
        limit: 1,
      }], { signal });
      
      const profileBadges = events.find(isValidProfileBadges);
      return profileBadges || null;
    },
    enabled: !!user?.pubkey,
  });
}

/**
 * Hook to get all badges for the current user with acceptance status
 */
export function useUserBadges() {
  const { user } = useCurrentUser();
  const { data: profileBadges } = useProfileBadges();
  const { data: awardedBadges = [] } = useUserAwardedBadges(user?.pubkey);
  
  // Combine awarded badges with profile badges to determine acceptance status
  const userBadges: UserBadge[] = awardedBadges.map(badge => {
    const isAccepted = !!profileBadges && extractBadgeReferences(profileBadges).some(
      ref => ref.eTag === badge.awardEventId
    );
    
    return {
      ...badge,
      accepted: isAccepted,
      order: 0, // Default order, will be updated below
    };
  });
  
  // Update order for accepted badges based on profile badges event
  if (profileBadges) {
    const refs = extractBadgeReferences(profileBadges);
    
    refs.forEach((ref, index) => {
      const badgeIndex = userBadges.findIndex(b => b.awardEventId === ref.eTag);
      if (badgeIndex >= 0) {
        userBadges[badgeIndex].order = index;
      }
    });
  }
  
  // Sort badges: accepted first (by order), then non-accepted (by issue date)
  return userBadges.sort((a, b) => {
    if (a.accepted && b.accepted) {
      return a.order - b.order;
    }
    if (a.accepted) return -1;
    if (b.accepted) return 1;
    return (b.issuedAt || 0) - (a.issuedAt || 0);
  });
}

/**
 * Hook to fetch a specific badge award by ID
 */
export function useBadgeAward(id: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['badge-award', id],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      
      signal = AbortSignal.any([signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query([{ ids: [id], kinds: [8] }], { signal });
      
      const award = events.find(isValidBadgeAward);
      return award || null;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch badges created by a specific issuer
 */
export function useIssuerBadges(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['issuer-badges', pubkey],
    queryFn: async ({ signal }) => {
      if (!pubkey) return [];
      
      signal = AbortSignal.any([signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query([{ 
        kinds: [30009], 
        authors: [pubkey],
        limit: 100,
      }], { signal });
      
      return events.filter(isValidBadgeDefinition);
    },
    enabled: !!pubkey,
  });
}