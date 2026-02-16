export function Footer() {
  return (
    <footer className="bg-muted border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-display font-bold text-lg text-primary mb-4">
              Voluntarios
            </h3>
            <p className="text-muted-foreground">
              Connecting volunteers with meaningful opportunities to serve their communities.
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="/opportunities" className="hover:text-primary transition-colors">Browse Opportunities</a></li>
              <li><a href="/login" className="hover:text-primary transition-colors">Login</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4">Contact</h4>
            <p className="text-muted-foreground">
              Email: info@voluntarios.com<br />
              Phone: (555) 123-4567
            </p>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center text-muted-foreground">
          <p>&copy; 2026 Voluntarios. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
