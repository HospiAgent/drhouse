import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HomeHero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-36 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              Built for Healthcare Professionals
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Your AI Medical Assistant for Enhanced Patient Care
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              MedAssist AI streamlines clinical workflows by transcribing conversations, generating clinical notes, and providing instant access to medical research—all in one secure platform.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" className="bg-primary text-primary-foreground">
                  Get Started Free
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-video overflow-hidden rounded-xl border bg-gradient-to-b from-muted/30 to-muted p-2 shadow-xl">
              <img
                src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Doctor using tablet interface"
                className="object-cover w-full h-full rounded-lg"
                style={{ objectPosition: "center 40%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}