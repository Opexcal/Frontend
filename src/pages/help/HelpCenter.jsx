import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { Card, CardContent } from "@/components/ui/card";

const tocItems = [
  { id: "check-url", label: "Check the URL" },
  { id: "check-email", label: "Check your email address" },
  { id: "reset-password", label: "Reset your password" },
  { id: "contact-admin", label: "Contact your admin" },
];

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="text-lg text-muted-foreground">Help Center</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Article Content */}
          <article className="lg:col-span-3 animate-fade-in">
            <h1 className="text-3xl font-display font-semibold text-foreground mb-8">
              I can't log in my account
            </h1>

            <Card className="mb-8">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <p className="text-foreground font-medium">OpexCal Help Center</p>
                  <p className="text-muted-foreground">
                    Having trouble logging in or accessing your dashboard?
                  </p>
                </div>

                <div id="reset-password" className="space-y-2">
                  <p className="text-foreground">
                    Forgot your password?{" "}
                    <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                      Reset here
                    </Link>
                  </p>
                </div>

                <div id="contact-admin" className="space-y-2">
                  <p className="text-foreground">
                    Account not recognized? Contact your organization's admin.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-foreground">
                    Other issues? Email us at{" "}
                    <a 
                      href="mailto:support@opexcal.io" 
                      className="text-primary hover:underline font-medium"
                    >
                      support@opexcal.io
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Help Sections */}
            <div className="space-y-6">
              <section id="check-url">
                <h2 className="text-xl font-semibold mb-3">Check the URL</h2>
                <p className="text-muted-foreground">
                  Make sure you're visiting the correct OpexCal login page. Your organization may have a custom subdomain (e.g., yourcompany.opexcal.io).
                </p>
              </section>

              <section id="check-email">
                <h2 className="text-xl font-semibold mb-3">Check your email address</h2>
                <p className="text-muted-foreground">
                  Ensure you're using the same email address you used when signing up or that your admin registered for you. Try checking for typos.
                </p>
              </section>
            </div>
          </article>

          {/* Sidebar - Table of Contents */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold text-foreground mb-4">On this page</h3>
              <nav className="space-y-2">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;
