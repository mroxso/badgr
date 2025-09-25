import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { cn } from '@/lib/utils';
import { LoginArea } from '@/components/auth/LoginArea';
// import { ThemeToggle } from '@/components/ThemeToggle';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button } from '@/components/ui/button';
import { SheetContent, SheetTrigger, Sheet } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BadgeLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function BadgeLayout({ children, title, description }: BadgeLayoutProps) {
  useSeoMeta({
    title: `${title} | Badgr`,
    description: description || 'A Nostr badges application based on NIP-58',
  });

  const location = useLocation();
  const isMobile = useIsMobile();
  
  const navItems = [
    { name: 'Explore', path: '/badges' },
    { name: 'My Badges', path: '/badges/my' },
    { name: 'Create', path: '/badges/create' },
  ];
  
  const renderNavLinks = () => (
    <nav className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            location.pathname === item.path
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground'
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/badges" className="flex items-center gap-2">
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarFallback className="bg-primary text-primary-foreground">B</AvatarFallback>
              </Avatar>
              <span className="font-bold text-lg">Badgr</span>
            </Link>
            
            {!isMobile && renderNavLinks()}
          </div>
          
          <div className="flex items-center gap-2">
            {/* <ThemeToggle /> */}
            <LoginArea className="max-w-40" />
            
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 sm:max-w-sm">
                  <div className="flex items-center justify-between">
                    <Link to="/badges" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 rounded-md">
                        <AvatarFallback className="bg-primary text-primary-foreground">B</AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-lg">Badgr</span>
                    </Link>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                      </Button>
                    </SheetTrigger>
                  </div>
                  <div className="mt-6 flex flex-col gap-4">
                    {renderNavLinks()}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-6 md:py-8">
        {children}
      </main>
      
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:h-16 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground order-2 md:order-1">
            Vibed with <a href="https://soapbox.pub/mkstack" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">MKStack</a> &copy; {new Date().getFullYear()} Badgr
          </p>
          <div className="flex space-x-4 order-1 md:order-2 mb-4 md:mb-0">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link to="/badges" className="text-sm text-muted-foreground hover:text-foreground">
              Badges
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}