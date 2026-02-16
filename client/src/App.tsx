import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Pages
import Landing from "./pages/Landing";
import OpportunitiesList from "./pages/OpportunitiesList";
import OpportunityDetail from "./pages/OpportunityDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/opportunities" component={OpportunitiesList} />
      <Route path="/opportunities/:id" component={OpportunityDetail} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Protected Routes */}
      <Route path="/dashboard/volunteer">
        {() => (
          <ProtectedRoute requiredRole="volunteer">
            <VolunteerDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/organization">
        {() => (
          <ProtectedRoute requiredRole="organization">
            <OrganizationDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/admin">
        {() => (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
