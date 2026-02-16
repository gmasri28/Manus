import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center py-12">
      <div className="text-center">
        <h1 className="font-display font-bold text-6xl text-primary mb-4">404</h1>
        <h2 className="font-display font-bold text-3xl mb-4">Page Not Found</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          Sorry, the page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <Button
          onClick={() => setLocation('/')}
          className="text-base font-semibold px-8 py-6"
          size="lg"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
