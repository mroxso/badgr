import { NostrEvent } from '@nostrify/nostrify';
import { Badge, BadgeAward, BadgeDefinition, ProfileBadges, UserBadge } from './types/badge';

/**
 * Extract badge identifier from a-tag (e.g., "30009:pubkey:badge_name")
 */
export function parseATagIdentifier(aTag: string): { kind: number; pubkey: string; identifier: string } | null {
  const parts = aTag.split(':');
  if (parts.length !== 3) return null;

  return {
    kind: parseInt(parts[0], 10),
    pubkey: parts[1],
    identifier: parts[2],
  };
}

/**
 * Create a Nostr a-tag reference from components
 */
export function createATagIdentifier(kind: number, pubkey: string, identifier: string): string {
  return `${kind}:${pubkey}:${identifier}`;
}

/**
 * Extract tag value by name from Nostr event
 */
export function getTagValue(event: NostrEvent, tagName: string): string | undefined {
  const tag = event.tags.find(tag => tag[0] === tagName);
  return tag?.[1];
}

/**
 * Get all tag values by name from Nostr event
 */
export function getAllTagValues(event: NostrEvent, tagName: string): string[] {
  return event.tags
    .filter(tag => tag[0] === tagName)
    .map(tag => tag[1]);
}

/**
 * Extract all values from a specific position in tags
 */
export function getTagValuesByPosition(event: NostrEvent, tagName: string, position: number): string[] {
  return event.tags
    .filter(tag => tag[0] === tagName && tag.length > position)
    .map(tag => tag[position]);
}

/**
 * Validate if an event is a valid badge definition
 */
export function isValidBadgeDefinition(event: NostrEvent): event is BadgeDefinition {
  return (
    event.kind === 30009 &&
    event.tags.some(tag => tag[0] === 'd')
  );
}

/**
 * Validate if an event is a valid badge award
 */
export function isValidBadgeAward(event: NostrEvent): event is BadgeAward {
  return (
    event.kind === 8 &&
    event.tags.some(tag => tag[0] === 'a') &&
    event.tags.some(tag => tag[0] === 'p')
  );
}

/**
 * Validate if an event is a valid profile badges list
 */
export function isValidProfileBadges(event: NostrEvent): event is ProfileBadges {
  return (
    event.kind === 30008 &&
    getTagValue(event, 'd') === 'profile_badges'
  );
}

/**
 * Process a badge definition event into a badge object
 */
export function processBadgeDefinition(definition: BadgeDefinition): Partial<Badge> {
  const badgeId = getTagValue(definition, 'd');
  if (!badgeId) return {};

  return {
    id: definition.id,
    name: getTagValue(definition, 'name'),
    description: getTagValue(definition, 'description'),
    image: getTagValue(definition, 'image'),
    thumb: getTagValue(definition, 'thumb'),
    issuerPubkey: definition.pubkey,
    definitionId: definition.id,
    badgeId,
  };
}

/**
 * Extract badge references from profile badges event
 * Returns array of paired a-tags and e-tags
 */
export function extractBadgeReferences(profileBadges: ProfileBadges): Array<{ aTag: string; eTag: string }> {
  const results: Array<{ aTag: string; eTag: string }> = [];
  
  // Get all a-tags and e-tags
  const aTags = profileBadges.tags.filter(tag => tag[0] === 'a').map(tag => tag[1]);
  const eTags = profileBadges.tags.filter(tag => tag[0] === 'e').map(tag => tag[1]);
  
  // Pair them together (NIP-58 requires consecutive pairs)
  for (let i = 0; i < Math.min(aTags.length, eTags.length); i++) {
    results.push({
      aTag: aTags[i],
      eTag: eTags[i],
    });
  }
  
  return results;
}

/**
 * Combine badge definition and award info into a complete badge object
 */
export function combineBadgeInfo(
  definition: BadgeDefinition,
  award?: BadgeAward
): Badge {
  const badge = processBadgeDefinition(definition) as Badge;
  
  if (award) {
    badge.awardId = award.id;
    badge.issuedAt = award.created_at;
  }
  
  return badge;
}

/**
 * Get image dimensions from tag if available
 * Format: "url dimensions" where dimensions is "WxH"
 */
export function getImageDimensions(imageTag: string): { width: number; height: number } | undefined {
  const parts = imageTag.split(' ');
  if (parts.length < 2) return undefined;
  
  const dimensions = parts[1].split('x');
  if (dimensions.length !== 2) return undefined;
  
  const width = parseInt(dimensions[0], 10);
  const height = parseInt(dimensions[1], 10);
  
  if (isNaN(width) || isNaN(height)) return undefined;
  
  return { width, height };
}