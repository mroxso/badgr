import { NostrEvent } from '@nostrify/nostrify';

/**
 * Badge Definition (Kind 30009)
 * Contains information about a badge
 */
export interface BadgeDefinition extends NostrEvent {
  kind: 30009;
}

/**
 * Badge Award (Kind 8)
 * References a badge definition and awards it to one or more pubkeys
 */
export interface BadgeAward extends NostrEvent {
  kind: 8;
}

/**
 * Profile Badges (Kind 30008)
 * User's collection of accepted badges
 */
export interface ProfileBadges extends NostrEvent {
  kind: 30008;
}

/**
 * Processed Badge data combining definition and award information
 */
export interface Badge {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  thumb?: string;
  issuerPubkey: string;
  definitionId: string;
  awardId?: string;
  awardEventId?: string;
  badgeId: string; // d-tag value from definition
  issuedAt?: number;
}

/**
 * Badge with additional user acceptance status
 */
export interface UserBadge extends Badge {
  accepted: boolean;
  order: number;
}