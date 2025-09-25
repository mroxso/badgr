import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { createATagIdentifier, getTagValue } from '@/lib/badge-utils';
import { BadgeDefinition, ProfileBadges } from '@/lib/types/badge';

interface CreateBadgeDefinitionParams {
  id: string;
  name: string;
  description?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  thumbnail?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

interface AwardBadgeParams {
  badgeDefinition: BadgeDefinition;
  recipients: string[];
}

interface UpdateProfileBadgesParams {
  badgeRefs: Array<{ aTag: string; eTag: string }>;
}

/**
 * Hook to create a new badge definition
 */
export function useCreateBadgeDefinition() {
  const { mutate: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateBadgeDefinitionParams) => {
      const tags: string[][] = [
        ['d', params.id],
        ['name', params.name],
      ];

      if (params.description) {
        tags.push(['description', params.description]);
      }

      if (params.image) {
        const imageTag = params.imageWidth && params.imageHeight
          ? `${params.image} ${params.imageWidth}x${params.imageHeight}`
          : params.image;
        tags.push(['image', imageTag]);
      }

      if (params.thumbnail) {
        const thumbTag = params.thumbnailWidth && params.thumbnailHeight
          ? `${params.thumbnail} ${params.thumbnailWidth}x${params.thumbnailHeight}`
          : params.thumbnail;
        tags.push(['thumb', thumbTag]);
      }

      return new Promise<string>((resolve, reject) => {
        createEvent(
          { kind: 30009, tags, content: '' },
          {
            onSuccess: (event) => {
              resolve(event.id);
            },
            onError: (error) => {
              reject(error);
            }
          }
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badge-definitions'] });
    }
  });
}

/**
 * Hook to award a badge to one or more recipients
 */
export function useAwardBadge() {
  const { mutate: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AwardBadgeParams) => {
      const { badgeDefinition, recipients } = params;
      
      if (!badgeDefinition || recipients.length === 0) {
        throw new Error('Badge definition and at least one recipient are required');
      }

      const badgeId = getTagValue(badgeDefinition, 'd');
      if (!badgeId) {
        throw new Error('Invalid badge definition');
      }

      // Create a-tag for the badge definition
      const aTag = createATagIdentifier(30009, badgeDefinition.pubkey, badgeId);
      
      // Create p-tags for recipients
      const pTags = recipients.map(pubkey => ['p', pubkey]);
      
      const tags = [
        ['a', aTag],
        ...pTags
      ];

      return new Promise<string>((resolve, reject) => {
        createEvent(
          { kind: 8, tags, content: '' },
          {
            onSuccess: (event) => {
              resolve(event.id);
            },
            onError: (error) => {
              reject(error);
            }
          }
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-awarded-badges'] });
    }
  });
}

/**
 * Hook to update a user's profile badges
 */
export function useUpdateProfileBadges() {
  const { mutate: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (params: UpdateProfileBadgesParams) => {
      if (!user) {
        throw new Error('User must be logged in to update profile badges');
      }

      const { badgeRefs } = params;
      
      // Create tags for the profile badges event
      const tags: string[][] = [
        ['d', 'profile_badges'],
      ];

      // Add a-tags and e-tags in order
      badgeRefs.forEach(ref => {
        tags.push(['a', ref.aTag]);
        tags.push(['e', ref.eTag]);
      });

      return new Promise<string>((resolve, reject) => {
        createEvent(
          { kind: 30008, tags, content: '' },
          {
            onSuccess: (event) => {
              resolve(event.id);
            },
            onError: (error) => {
              reject(error);
            }
          }
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-badges'] });
    }
  });
}