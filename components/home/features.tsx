import { 
  Mic, 
  FileText, 
  Search, 
  Lock, 
  LineChart, 
  Calendar 
} from 'lucide-react';

export function HomeFeatures() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Designed for Medical Excellence
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Powerful tools to enhance your clinical workflow and patient care
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8 md:mt-12">
          <FeatureCard
            icon={<Mic className="h-10 w-10 text-primary" />}
            title="Conversation Capture"
            description="Securely record and transcribe patient conversations with AI analysis that highlights key medical details."
          />
          <FeatureCard
            icon={<FileText className="h-10 w-10 text-primary" />}
            title="Intelligent Note Taking"
            description="Generate structured clinical notes from conversations with customizable templates that match your specialty."
          />
          <FeatureCard
            icon={<Search className="h-10 w-10 text-primary" />}
            title="Instant Research"
            description="Access medical databases and recent studies without leaving the platform, ensuring evidence-based decisions."
          />
          <FeatureCard
            icon={<Lock className="h-10 w-10 text-primary" />}
            title="HIPAA Compliant"
            description="Enterprise-grade security with end-to-end encryption and strict access controls that meet healthcare standards."
          />
          <FeatureCard
            icon={<LineChart className="h-10 w-10 text-primary" />}
            title="Analytics Dashboard"
            description="Track patient interactions, treatment patterns, and clinical outcomes with intuitive visualizations."
          />
          <FeatureCard
            icon={<Calendar className="h-10 w-10 text-primary" />}
            title="Appointment Integration"
            description="Seamlessly connect with your existing calendar system to prepare for upcoming patient visits."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted/50 group-hover:bg-primary/5">
        {icon}
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}