import { BadgeLayout } from '@/components/badges/BadgeLayout';
import { BadgeCreationForm } from '@/components/badges/BadgeCreationForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export function CreateBadge() {
  return (
    <BadgeLayout title="Create Badge" description="Create your own badge on Nostr">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Create Badge</h1>
          <p className="text-muted-foreground">
            Design and publish your own badge that can be awarded to other users on Nostr.
          </p>
        </div>
        
        <Alert className="bg-primary/10 border-primary/20 text-primary-foreground">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>About Badges</AlertTitle>
          <AlertDescription className="mt-2">
            <p>Badges are a way to recognize and appreciate others on Nostr. When you create a badge:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>You become the badge issuer and can award it to others</li>
              <li>Recipients can choose to display the badge on their profiles</li>
              <li>Badges are immutable and cannot be transferred or revoked</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <BadgeCreationForm />
      </div>
    </BadgeLayout>
  );
}

export default CreateBadge;