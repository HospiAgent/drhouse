"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CheckCircle2, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  specialty: z.string({
    required_error: "Please select a specialty.",
  }),
  credentials: z.string().optional(),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  practice: z.string().optional(),
});

export default function OnboardingPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialty: "",
      credentials: "",
      phoneNumber: "",
      practice: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile updated",
        description: "Your professional details have been saved.",
      });
      setCurrentStep(2);
    }, 1500);
  }

  return (
    <div className="container max-w-6xl py-6">
      <div className="mb-8">
        <div className="flex items-center justify-center mb-8">
          <div className="relative flex items-center justify-center w-full max-w-2xl">
            <Separator className="absolute w-full" />
            <div className="relative flex items-center justify-center gap-4 md:gap-8">
              <StepIndicator 
                step={1} 
                currentStep={currentStep} 
                title="Professional Profile" 
              />
              <StepIndicator 
                step={2} 
                currentStep={currentStep} 
                title="Platform Features" 
              />
            </div>
          </div>
        </div>
        
        {currentStep === 1 ? (
          <div className="space-y-6 md:space-y-8 max-w-2xl mx-auto">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Complete Your Professional Profile</h1>
              <p className="text-muted-foreground">
                Tell us about your medical practice to help us customize MedAssist AI for your needs.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Specialty</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="dermatology">Dermatology</SelectItem>
                          <SelectItem value="emergency">Emergency Medicine</SelectItem>
                          <SelectItem value="family">Family Medicine</SelectItem>
                          <SelectItem value="internal">Internal Medicine</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="obgyn">OB/GYN</SelectItem>
                          <SelectItem value="oncology">Oncology</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="psychiatry">Psychiatry</SelectItem>
                          <SelectItem value="surgery">Surgery</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This helps us customize terminology and templates for your field.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="credentials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Credentials</FormLabel>
                      <FormControl>
                        <Input placeholder="MD, PhD, FACP, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        Your certifications and professional designations.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormDescription>
                        For account verification and important notifications only.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="practice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice/Hospital Affiliation</FormLabel>
                      <FormControl>
                        <Input placeholder="Mayo Clinic, Johns Hopkins, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        Where you primarily practice medicine.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Continue"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <FeaturesOverview />
        )}
      </div>
    </div>
  );
}

function StepIndicator({ 
  step, 
  currentStep, 
  title 
}: { 
  step: number; 
  currentStep: number;
  title: string;
}) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={`
          relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 
          ${isCompleted 
            ? "border-primary bg-primary text-primary-foreground" 
            : isActive 
              ? "border-primary bg-background text-foreground" 
              : "border-muted-foreground/20 bg-muted text-muted-foreground"
          }
        `}
      >
        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : step}
      </div>
      <span 
        className={`text-sm font-medium ${
          isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
        } hidden md:block`}
      >
        {title}
      </span>
    </div>
  );
}

function FeaturesOverview() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your AI Medical Assistant Is Ready</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          MedAssist AI is customized for your specialty. Explore these powerful features designed to enhance your practice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          title="Conversation Capture"
          description="Securely record and transcribe patient conversations with AI analysis that highlights key medical details."
          icon="🎙️"
        />
        <FeatureCard
          title="Instant Research"
          description="Access medical databases and recent studies without leaving the platform, ensuring evidence-based decisions."
          icon="🔍"
        />
        <FeatureCard
          title="Intelligent Note Taking"
          description="Generate structured clinical notes from conversations with customizable templates that match your specialty."
          icon="📝"
        />
      </div>

      <div className="flex justify-center mt-8">
        <Link href="/dashboard">
          <Button size="lg" className="px-8">
            Get Started
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <p className="text-sm text-center text-muted-foreground mt-4">
        Need help getting started? <Link href="/help" className="text-primary hover:text-primary/80">Take the interactive tour</Link>
      </p>
    </div>
  );
}

function FeatureCard({ 
  title, 
  description, 
  icon 
}: { 
  title: string; 
  description: string;
  icon: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col space-y-2">
        <div className="text-3xl">{icon}</div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        <Link href="#" className="text-primary hover:underline text-sm mt-2">
          Learn more
        </Link>
      </div>
    </div>
  );
}