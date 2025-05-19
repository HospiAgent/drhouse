import Link from 'next/link';
import { Microscope } from 'lucide-react';

export function MainNav() {
  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/" className="flex items-center space-x-2">
        <Microscope className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl">MedAssist AI</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-6">
        <Link
          href="#features"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Features
        </Link>
        <Link
          href="#benefits"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Benefits
        </Link>
        <Link
          href="#pricing"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Pricing
        </Link>
        <Link
          href="#faq"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          FAQ
        </Link>
      </nav>
    </div>
  );
}