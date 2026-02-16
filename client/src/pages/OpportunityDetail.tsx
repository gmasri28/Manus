import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { publicApi, volunteerApi } from '@/lib/api';
import { Calendar, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  organizationName: string;
  location: string;
  startDate: string;
  endDate: string;
  totalSlots: number;
  remainingSlots: number;
  status: string;
}

export default function OpportunityDetail({ params }: { params: { id: string } }) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const { isAuthenticated, token } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadOpportunity();
  }, [params.id]);

  const loadOpportunity = async () => {
    try {
      const data = await publicApi.getOpportunityDetail(params.id);
      setOpportunity(data);
    } catch (error) {
      console.error('Failed to load opportunity:', error);
      toast.error('Failed to load opportunity details');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    setSigningUp(true);
    try {
      await volunteerApi.signupForOpportunity(params.id, token!);
      toast.success('Successfully signed up for this opportunity!');
      setLocation('/dashboard/volunteer');
    } catch (error) {
      toast.error('Failed to sign up. Please try again.');
    } finally {
      setSigningUp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground text-lg">Opportunity not found</p>
      </div>
    );
  }

  const isFull = opportunity.remainingSlots === 0;
  const isClosed = opportunity.status === 'Closed' || opportunity.status === 'Full';

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <button
          onClick={() => setLocation('/opportunities')}
          className="text-primary hover:underline mb-6 font-semibold"
        >
          ← Back to Opportunities
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-8">
              <h1 className="font-display font-bold text-4xl mb-2 text-foreground">
                {opportunity.title}
              </h1>
              <p className="text-primary font-semibold text-lg mb-6">
                {opportunity.organizationName}
              </p>

              <div className="space-y-4 mb-8 pb-8 border-b border-border">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin size={20} />
                  <span className="text-lg">{opportunity.location}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar size={20} />
                  <span className="text-lg">
                    {new Date(opportunity.startDate).toLocaleDateString()} -{' '}
                    {new Date(opportunity.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Users size={20} />
                  <span className="text-lg">
                    {opportunity.remainingSlots} of {opportunity.totalSlots} slots available
                  </span>
                </div>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl mb-4">About This Opportunity</h2>
                <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                  {opportunity.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-card rounded-lg border border-border p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-2">Available Slots</div>
                <div className="text-4xl font-display font-bold text-primary">
                  {opportunity.remainingSlots}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  out of {opportunity.totalSlots} total
                </div>
              </div>

              {isFull && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
                  <p className="text-destructive font-semibold">This opportunity is full</p>
                </div>
              )}

              {isClosed && (
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <p className="text-muted-foreground font-semibold">
                    This opportunity is no longer accepting sign-ups
                  </p>
                </div>
              )}

              <Button
                onClick={handleSignup}
                disabled={isClosed || signingUp}
                className="w-full text-base font-semibold py-6"
                size="lg"
              >
                {signingUp ? 'Signing up...' : isClosed ? 'Not Available' : 'Sign Up Now'}
              </Button>

              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  You'll be redirected to login to sign up
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
