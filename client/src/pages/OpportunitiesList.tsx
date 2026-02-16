import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { Calendar, MapPin, Users } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  organizationName: string;
  location: string;
  startDate: string;
  endDate: string;
  totalSlots: number;
  remainingSlots: number;
  status: string;
}

export default function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('');
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      const data = await publicApi.getOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (locationFilter && !opp.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    return opp.status === 'Published';
  });

  const uniqueLocations = Array.from(
    new Set(opportunities.map((opp) => opp.location))
  );

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="font-display font-bold text-4xl mb-8">Volunteer Opportunities</h1>

        {/* Filters */}
        <div className="bg-card rounded-lg p-6 mb-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Filter by Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No opportunities found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="font-display font-bold text-xl mb-2 text-foreground">
                    {opp.title}
                  </h3>
                  <p className="text-primary font-semibold mb-4">{opp.organizationName}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin size={18} />
                      <span>{opp.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={18} />
                      <span>
                        {new Date(opp.startDate).toLocaleDateString()} -{' '}
                        {new Date(opp.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users size={18} />
                      <span>{opp.remainingSlots} of {opp.totalSlots} slots available</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setLocation(`/opportunities/${opp.id}`)}
                      className="flex-1 text-base"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
