import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, CheckCircle, XCircle } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

interface Opportunity {
  id: string;
  title: string;
  organizationName: string;
  status: string;
}

interface Signup {
  id: string;
  volunteerEmail: string;
  opportunityTitle: string;
  organizationName: string;
  status: string;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('organizations');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'organizations') {
        const data = await adminApi.getOrganizations(token!);
        setOrganizations(data);
      } else if (activeTab === 'opportunities') {
        const data = await adminApi.getOpportunities(token!);
        setOpportunities(data);
      } else if (activeTab === 'signups') {
        const data = await adminApi.getSignups(token!);
        setSignups(data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createOrganization(formData, token!);
      toast.success('Organization created successfully');
      setFormData({ name: '', email: '', description: '' });
      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create organization');
    }
  };

  const handleUpdateStatus = async (orgId: string, newStatus: string) => {
    try {
      await adminApi.updateOrganizationStatus(orgId, newStatus, token!);
      toast.success(`Organization ${newStatus.toLowerCase()}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrganizations = organizations.filter((org) => {
    if (statusFilter === 'all') return true;
    return org.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <h1 className="font-display font-bold text-4xl mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {['organizations', 'opportunities', 'signups'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-display font-bold text-2xl">Manage Organizations</h2>
              </div>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="text-base font-semibold"
              >
                <Plus size={20} className="mr-2" />
                New Organization
              </Button>
            </div>

            {/* Create Form */}
            {showForm && (
              <div className="bg-card rounded-lg border border-border p-8 mb-8">
                <h3 className="font-display font-bold text-xl mb-6">Create Organization</h3>
                <form onSubmit={handleCreateOrganization} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Organization Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" className="text-base font-semibold">
                      Create
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

            {/* Status Filter */}
            <div className="mb-6">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            {/* Organizations List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className="bg-card rounded-lg border border-border p-6 flex justify-between items-center hover:shadow-md transition-shadow"
                  >
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground">
                        {org.name}
                      </h3>
                      <p className="text-muted-foreground">{org.email}</p>
                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                        {org.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {org.status === 'Pending' && (
                        <>
                          <Button
                            onClick={() => handleUpdateStatus(org.id, 'Approved')}
                            className="text-base"
                          >
                            <CheckCircle size={18} className="mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleUpdateStatus(org.id, 'Rejected')}
                            variant="outline"
                            className="text-base"
                          >
                            <XCircle size={18} className="mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {org.status === 'Approved' && (
                        <Button
                          onClick={() => handleUpdateStatus(org.id, 'Disabled')}
                          variant="outline"
                          className="text-base"
                        >
                          Disable
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div>
            <h2 className="font-display font-bold text-2xl mb-6">All Opportunities</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display font-bold text-lg text-foreground">
                          {opp.title}
                        </h3>
                        <p className="text-muted-foreground">{opp.organizationName}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                        {opp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Signups Tab */}
        {activeTab === 'signups' && (
          <div>
            <h2 className="font-display font-bold text-2xl mb-6">All Volunteer Sign-ups</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {signups.map((signup) => (
                  <div
                    key={signup.id}
                    className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground">{signup.volunteerEmail}</p>
                        <p className="text-muted-foreground">
                          {signup.opportunityTitle} • {signup.organizationName}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                        {signup.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
