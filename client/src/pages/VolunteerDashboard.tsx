import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { volunteerApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Calendar, MapPin, X } from 'lucide-react';

interface Signup {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organizationName: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'Registered' | 'Completed' | 'Cancelled';
  signupDate: string;
}

export default function VolunteerDashboard() {
  const { token } = useAuth();
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    loadSignups();
  }, []);

  const loadSignups = async () => {
    try {
      const data = await volunteerApi.getSignups(token!);
      setSignups(data);
    } catch (error) {
      toast.error('Failed to load your sign-ups');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (signupId: string) => {
    if (!window.confirm('Are you sure you want to cancel this sign-up?')) {
      return;
    }

    setCancelling(signupId);
    try {
      await volunteerApi.cancelSignup(signupId, token!);
      toast.success('Sign-up cancelled successfully');
      loadSignups();
    } catch (error) {
      toast.error('Failed to cancel sign-up');
    } finally {
      setCancelling(null);
    }
  };

  const upcomingSignups = signups.filter((s) => s.status === 'Registered');
  const pastSignups = signups.filter((s) => s.status !== 'Registered');

  const getStatusBadge = (status: string) => {
    const colors = {
      Registered: 'bg-primary/10 text-primary',
      Completed: 'bg-green-100 text-green-700',
      Cancelled: 'bg-destructive/10 text-destructive',
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="font-display font-bold text-4xl mb-2">My Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage your volunteer sign-ups and history</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Sign-ups */}
            <section>
              <h2 className="font-display font-bold text-2xl mb-6">Upcoming Opportunities</h2>
              {upcomingSignups.length === 0 ? (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <p className="text-muted-foreground">
                    You haven't signed up for any opportunities yet.{' '}
                    <a href="/opportunities" className="text-primary hover:underline font-semibold">
                      Browse opportunities
                    </a>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingSignups.map((signup) => (
                    <div
                      key={signup.id}
                      className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-display font-bold text-xl text-foreground">
                            {signup.opportunityTitle}
                          </h3>
                          <p className="text-primary font-semibold">{signup.organizationName}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(signup.status)}`}>
                          {signup.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin size={16} />
                          <span>{signup.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={16} />
                          <span>
                            {new Date(signup.startDate).toLocaleDateString()} -{' '}
                            {new Date(signup.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => handleCancel(signup.id)}
                        disabled={cancelling === signup.id}
                        className="w-full text-base"
                      >
                        {cancelling === signup.id ? 'Cancelling...' : 'Cancel Sign-up'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past Sign-ups */}
            <section>
              <h2 className="font-display font-bold text-2xl mb-6">Volunteer History</h2>
              {pastSignups.length === 0 ? (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <p className="text-muted-foreground">No volunteer history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastSignups.map((signup) => (
                    <div
                      key={signup.id}
                      className="bg-card rounded-lg border border-border p-6 flex justify-between items-center hover:shadow-sm transition-shadow"
                    >
                      <div>
                        <h3 className="font-display font-bold text-lg text-foreground">
                          {signup.opportunityTitle}
                        </h3>
                        <p className="text-muted-foreground">
                          {signup.organizationName} • {new Date(signup.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(signup.status)}`}>
                        {signup.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
