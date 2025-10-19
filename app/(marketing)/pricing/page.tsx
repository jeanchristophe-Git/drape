import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            DRAPE
          </Link>
          <nav className="flex gap-6 items-center">
            <Link href="/pricing" className="text-sm hover:underline">
              Pricing
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose the plan that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE Plan */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect to try it out</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>2 try-ons total</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Standard resolution (768x768)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Results in 20-40 seconds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">×</span>
                    <span className="text-muted-foreground">Watermark on images</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">×</span>
                    <span className="text-muted-foreground">7-day history only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">×</span>
                    <span className="text-muted-foreground">No HD downloads</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/auth/signup" className="w-full">
                  <Button variant="outline" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* PREMIUM Plan */}
            <Card className="border-2 border-primary relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>For fashion enthusiasts</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="font-semibold">Unlimited try-ons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>High resolution (1024x1024)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>No watermarks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Unlimited history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>HD downloads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Priority processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Cancel anytime</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full">
                    Upgrade to Premium
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* FAQ */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  How does the free plan work?
                </h3>
                <p className="text-muted-foreground">
                  You get 2 free try-ons when you sign up. No credit card required. Images will have a watermark and are kept for 7 days.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Can I cancel my Premium subscription anytime?
                </h3>
                <p className="text-muted-foreground">
                  Yes! You can cancel anytime from your account settings. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  What happens after I use my 2 free try-ons?
                </h3>
                <p className="text-muted-foreground">
                  You'll need to upgrade to Premium to continue using the service. Premium gives you unlimited try-ons for $9.99/month.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  How long does it take to generate results?
                </h3>
                <p className="text-muted-foreground">
                  Most results are ready in 20-40 seconds. Premium members get priority processing for even faster results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 DRAPE. All rights reserved.
            </p>
            <nav className="flex gap-6">
              <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
