import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Heart, Users, Globe } from 'lucide-react';

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
              Make a Difference in Your Community
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover meaningful volunteer opportunities that align with your passion. Connect with organizations making real impact and earn your social service hours while helping others.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setLocation('/opportunities')}
                className="text-base font-semibold px-8 py-6"
              >
                Browse Opportunities
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation('/register')}
                className="text-base font-semibold px-8 py-6"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-12">
            Why Choose Voluntarios?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Heart className="text-primary" size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Meaningful Impact</h3>
              <p className="text-muted-foreground">
                Contribute to causes you care about and make a real difference in your community.
              </p>
            </div>
            <div className="bg-card rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary" size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Connect & Grow</h3>
              <p className="text-muted-foreground">
                Meet like-minded volunteers and build valuable connections while gaining experience.
              </p>
            </div>
            <div className="bg-card rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="text-primary" size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Easy to Use</h3>
              <p className="text-muted-foreground">
                Simple, intuitive platform designed for everyone. Find and sign up for opportunities in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of volunteers already making a difference. Start exploring opportunities today.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setLocation('/opportunities')}
            className="text-base font-semibold px-8 py-6"
          >
            Explore Opportunities Now
          </Button>
        </div>
      </section>
    </div>
  );
}
