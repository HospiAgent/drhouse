"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { setAuthData } from "@/utils/auth";
import { PublicRoute } from "@/components/auth/protected-route";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/auth/auth-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z
  .object({
    firstName: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    contact_number: z.string().optional(),
    specialization: z.string().min(1, {
      message: "Please select your specialization.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const specializations = [
  "General Practitioner",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Orthopedics",
  "Ophthalmology",
  "Psychiatry",
  "Endocrinology",
  "Gastroenterology",
  "Radiology",
];

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [opacity, setOpacity] = useState(1);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contact_number: "",
      specialization: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  function onSubmit(values) {
    setIsLoading(true);

    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      contactNumber: values.contact_number,
      specialization: values.specialization,
      password: values.password,
      confirmPassword: values.confirmPassword,
      agreeToTerms: values.terms,
    };

    fetch("https://monkfish-app-hnnle.ondigitalocean.app/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          // Extract the specific error message from the API response
          throw new Error(data.message || "Signup failed");
        }

        return data;
      })
      .then((data) => {
        setIsLoading(false);

        // Store the JWT token and user data
        if (data.user && data.token) {
          const userData = {
            id: data.user.id,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            contactNumber: data.user.contactNumber,
            specialization: data.user.specialization,
          };
          setAuthData(data.token, userData);
        }

        toast({
          title: "Account created",
          description: "Welcome to Dr.House. Let's set up your profile.",
        });

        // Start the transition animation
        setIsTransitioning(true);

        // The actual navigation will happen in the useEffect
      })
      .catch((error) => {
        setIsLoading(false);
        toast({
          title: "Signup failed",
          description:
            error.message || "Please check your information and try again",
          variant: "destructive",
        });
      });
  }

  // Handle the transition animation
  useEffect(() => {
    if (isTransitioning) {
      // Start fading out
      const fadeOutInterval = setInterval(() => {
        setOpacity((prev) => {
          const newOpacity = Math.max(prev - 0.05, 0);
          if (newOpacity <= 0) {
            clearInterval(fadeOutInterval);
            // Navigate when fully faded out
            router.push("/dashboard");
          }
          return newOpacity;
        });
      }, 20);

      return () => clearInterval(fadeOutInterval);
    }
  }, [isTransitioning, router]);

  return (
    <PublicRoute>
      <div style={{ opacity, transition: "opacity 0.5s ease" }}>
        <AuthLayout
          title="Create an account"
          subtitle="Sign up to get started with Dr.House"
          imageUrl="https://imgs.search.brave.com/6caUJero8Y-uD3L1Jk7Mqa-K1HO11BtQotU0-DGZvA0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9lYXN5/LXBlYXN5LmFpL2Nk/bi1jZ2kvaW1hZ2Uv/cXVhbGl0eT04MCxm/b3JtYXQ9YXV0byx3/aWR0aD03MDAvaHR0/cHM6Ly9tZWRpYS5l/YXN5LXBlYXN5LmFp/LzY0MzEwMjVjLWVj/NmItNDAwNi1iOTVi/LTdlZjI3YzY3MWJi/Yi83MWFiY2M0Mi1h/ZjAwLTQ0MTYtYjc5/My1lMWE5MjQ3NTE2/ODUucG5n"
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 w-full sm:max-w-md md:max-w-lg mx-auto border rounded-xl p-6 md:p-8 shadow-md  backdrop-blur-sm"
            >
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="h-14 px-4 w-full text-base"
                          placeholder="First Name"
                          autoComplete="given-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="h-14 px-4 w-full text-base"
                          placeholder="Last Name"
                          autoComplete="family-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Email & Contact Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="h-14 px-4 w-full text-base"
                          placeholder="Email Address"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="h-14 px-4 w-full text-base"
                          placeholder="Contact Number"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 3: Specialization (full width) */}
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 px-4 w-full text-base">
                          <SelectValue placeholder="Select your specialization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Row 4: Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Input
                            className="h-14 px-4 pr-10 w-full text-base"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Input
                            className="h-14 px-4 pr-10 w-full text-base"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Terms and Conditions */}
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="text-sm leading-none">
                      <label className="font-medium cursor-pointer">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-primary hover:underline"
                        >
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 text-lg font-medium mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              Log in
            </Link>
          </p>
        </AuthLayout>
      </div>
    </PublicRoute>
  );
}
