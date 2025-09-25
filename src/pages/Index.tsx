import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// import { ThemeToggle } from '@/components/ThemeToggle';
import { LoginArea } from '@/components/auth/LoginArea';
import { BadgeCheck, GraduationCap, Award, Users } from 'lucide-react';

const Index = () => {
  useSeoMeta({
    title: 'Badgr - Nostr Badges',
    description: 'Create, award and collect badges on the Nostr network using NIP-58',
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Badgr</span>
          </div>
          {/* <div className="flex items-center gap-4"> */}
            {/* <ThemeToggle /> */}
            <LoginArea className="max-w-40 mx-4" />
          {/* </div> */}
        </div>
      </header>
      
      {/* Hero */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Recognize achievement with <span className="text-primary">Nostr Badges</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Create, award, and collect badges on the decentralized Nostr network
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/badges">Explore Badges</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/badges/create">Create Badge</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need for Nostr badges</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Badges</h3>
              <p className="text-muted-foreground">
                Design custom badges with images and descriptions to recognize achievements or contributions.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Award Badges</h3>
              <p className="text-muted-foreground">
                Award your badges to deserving recipients across the Nostr network with just a few clicks.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Display Your Collection</h3>
              <p className="text-muted-foreground">
                Curate your badge collection and show it off on your Nostr profile for everyone to see.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get started with Badgr today</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the Nostr network and start recognizing achievements with badges
          </p>
          <Button asChild size="lg">
            <Link to="/badges">Start Exploring</Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BadgeCheck className="h-5 w-5 text-primary" />
            <span className="font-bold">Badgr</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
            <Link to="/badges" className="text-sm text-muted-foreground hover:text-foreground">
              Explore
            </Link>
            <Link to="/badges/my" className="text-sm text-muted-foreground hover:text-foreground">
              My Badges
            </Link>
            <Link to="/badges/create" className="text-sm text-muted-foreground hover:text-foreground">
              Create Badge
            </Link>
          </div>
          
          <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
            Vibed with <a href="https://soapbox.pub/mkstack" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">MKStack</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
