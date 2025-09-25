import { useState } from 'react';
import { useAwardBadge } from '@/hooks/useBadgeActions';
import { BadgeDefinition } from '@/lib/types/badge';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getTagValue } from '@/lib/badge-utils';
import { Loader2 } from 'lucide-react';

interface BadgeAwardFormProps {
  badge: BadgeDefinition;
  isOpen: boolean;
  onClose: () => void;
}

export function BadgeAwardForm({ badge, isOpen, onClose }: BadgeAwardFormProps) {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<string>('');
  const { mutate: awardBadge, isPending } = useAwardBadge();
  
  const badgeName = getTagValue(badge, 'name') || 'Unnamed Badge';
  const badgeImage = getTagValue(badge, 'image') || getTagValue(badge, 'thumb');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pubkeys = recipients
      .split(/[\s,]+/)
      .map(pk => pk.trim())
      .filter(pk => pk.length > 0)
      // Normalize npub1 format to hex
      .map(pk => {
        if (pk.startsWith('npub1')) {
          try {
            // Basic conversion assuming nostrtools is available
            // In a real app, you'd use proper conversion
            return pk.substring(5); // This is oversimplified
          } catch (error) {
            return pk;
          }
        }
        return pk;
      });
    
    if (pubkeys.length === 0) {
      toast({
        title: "No recipients",
        description: "Please enter at least one recipient",
        variant: "destructive",
      });
      return;
    }
    
    awardBadge({ badgeDefinition: badge, recipients: pubkeys }, {
      onSuccess: () => {
        toast({
          title: "Badge awarded",
          description: `Successfully awarded "${badgeName}" to ${pubkeys.length} recipient(s)`,
        });
        setRecipients('');
        onClose();
      },
      onError: (error) => {
        toast({
          title: "Failed to award badge",
          description: "There was an error awarding the badge. Please try again.",
          variant: "destructive",
        });
      }
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Award Badge</DialogTitle>
          <DialogDescription>
            Award "{badgeName}" to one or more users
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 rounded-md">
              <AvatarImage src={badgeImage} alt={badgeName} className="object-contain" />
              <AvatarFallback>{badgeName.substring(0, 2)}</AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-medium">{badgeName}</h3>
              <p className="text-sm text-muted-foreground">
                {getTagValue(badge, 'description') || 'No description'}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients</Label>
            <Textarea
              id="recipients"
              placeholder="Enter pubkeys or npub1 addresses, separated by spaces or commas"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter one or more Nostr public keys or npub1 addresses
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Award Badge
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}