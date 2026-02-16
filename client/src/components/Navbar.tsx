import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Browse Opportunities', href: '/opportunities' },
  ];

  const dashboardLinks = {
    volunteer: { label: 'My Dashboard', href: '/dashboard/volunteer' },
    organization: { label: 'Organization', href: '/dashboard/organization' },
    admin: { label: 'Admin Panel', href: '/dashboard/admin' },
  };

  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="font-display font-bold text-xl text-primary">
              Voluntarios
            </a>
            <div className="hidden md:flex gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                {user && dashboardLinks[user.role as keyof typeof dashboardLinks] && (
                  <a
                    href={dashboardLinks[user.role as keyof typeof dashboardLinks].href}
                    className="text-primary hover:underline"
                  >
                    {dashboardLinks[user.role as keyof typeof dashboardLinks].label}
                  </a>
                )}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-base"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/login')}
                  className="text-base"
                >
                  Login
                </Button>
                <Button
                  onClick={() => setLocation('/register')}
                  className="text-base"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-foreground hover:text-primary py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated ? (
              <>
                <div className="text-sm text-muted-foreground py-2">
                  {user?.email}
                </div>
                {user && dashboardLinks[user.role as keyof typeof dashboardLinks] && (
                  <a
                    href={dashboardLinks[user.role as keyof typeof dashboardLinks].href}
                    className="block text-primary py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    {dashboardLinks[user.role as keyof typeof dashboardLinks].label}
                  </a>
                )}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full text-base"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLocation('/login');
                    setMobileOpen(false);
                  }}
                  className="w-full text-base"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setLocation('/register');
                    setMobileOpen(false);
                  }}
                  className="w-full text-base"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
