import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { organizationApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Edit2, Users, Download } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  totalSlots: number;
  remainingSlots: number;
  status: string;
}

interface Volunteer {
  id: string;
  email: string;
  status: string;
}

export default function OrganizationDashboard() {
  const { token } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    totalSlots: '',
  });

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      const data = await organizationApi.getOpportunities(token!);
      setOpportunities(data);
    } catch (error) {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteers = async (oppId: string) => {
    try {
      const data = await organizationApi.getVolunteers(oppId, token!);
      setVolunteers(data);
      setSelectedOppId(oppId);
    } catch (error) {
      toast.error('Failed to load volunteers');
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await organizationApi.createOpportunity(formData, token!);
      toast.success('Opportunity created successfully');
      setFormData({
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        totalSlots: '',
      });
      setShowForm(false);
      loadOpportunities();
    } catch (error) {
      toast.error('Failed to create opportunity');
    }
  };

  const handleExportCSV = async (oppId: string) => {
    try {
      const data = await organizationApi.exportVolunteers(oppId, token!);
      const csv = convertToCSV(data);
      downloadCSV(csv, 'volunteers.csv');
      toast.success('Volunteers exported successfully');
    } catch (error) {
      toast.error('Failed to export volunteers');
    }
  };

  const convertToCSV = (data: any[]) => {
    const headers = ['Email', 'Status', 'Sign-up Date'];
    const rows = data.map((v) => [v.email, v.status, v.signupDate]);
    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display font-bold text-4xl mb-2">Organization Dashboard</h1>
            <p className="text-muted-foreground">Manage your volunteer opportunities</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="text-base font-semibold"
          >
            <Plus size={20} className="mr-2" />
            New Opportunity
          </Button>
        </div>

        {/* Create Opportunity Form */}
        {showForm && (
          <div className="bg-card rounded-lg border border-border p-8 mb-8">
            <h2 className="font-display font-bold text-2xl mb-6">Create New Opportunity</h2>
            <form onSubmit={handleCreateOpportunity} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Total Slots</label>
                  <input
                    type="number"
                    value={formData.totalSlots}
                    onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="text-base font-semibold">
                  Create Opportunity
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="text-base"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Opportunities List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground mb-4">No opportunities yet</p>
            <Button onClick={() => setShowForm(true)} className="text-base">
              Create Your First Opportunity
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-xl text-foreground">
                      {opp.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {opp.location} • {new Date(opp.startDate).toLocaleDateString()} to{' '}
                      {new Date(opp.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                    {opp.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Slots Available</p>
                    <p className="font-display font-bold text-lg">
                      {opp.remainingSlots}/{opp.totalSlots}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registered</p>
                    <p className="font-display font-bold text-lg">
                      {opp.totalSlots - opp.remainingSlots}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => loadVolunteers(opp.id)}
                    className="text-base"
                  >
                    <Users size={18} className="mr-2" />
                    View Volunteers
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportCSV(opp.id)}
                    className="text-base"
                  >
                    <Download size={18} className="mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Volunteers Modal */}
        {selectedOppId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-96 overflow-auto">
              <div className="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-center">
                <h2 className="font-display font-bold text-2xl">Volunteers</h2>
                <button
                  onClick={() => setSelectedOppId(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                {volunteers.length === 0 ? (
                  <p className="text-muted-foreground">No volunteers registered yet</p>
                ) : (
                  <div className="space-y-3">
                    {volunteers.map((v) => (
                      <div
                        key={v.id}
                        className="flex justify-between items-center p-4 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{v.email}</p>
                          <p className="text-sm text-muted-foreground">{v.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
