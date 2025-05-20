import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HomeCTA() {
  return (
    <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Ready to Transform Your Practice?
            </h2>
            <p className="max-w-[700px] text-primary-foreground/80 md:text-xl">
              Join thousands of healthcare professionals who are saving time and improving patient outcomes with Dr.House AI.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="text-sm text-primary-foreground/70">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </div>
    </section>
  );
}