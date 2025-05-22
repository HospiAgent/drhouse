"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { setAuthData } from "@/utils/auth";
import { PublicRoute } from "@/components/auth/protected-route";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/auth/auth-layout";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  remember: z.boolean().default(false).optional(),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [opacity, setOpacity] = useState(1);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  function onSubmit(values) {
    setIsLoading(true);

    fetch("https://content-panel.lvl.fit/drhouse/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          // Extract the specific error message from the API response
          throw new Error(data.message || "Login failed");
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
          title: "Login successful",
          description: "Welcome back to Dr.House",
        });

        // Start the transition animation
        setIsTransitioning(true);

        // The actual navigation will happen in the useEffect
      })
      .catch((error) => {
        setIsLoading(false);
        toast({
          title: "Login failed",
          description:
            error.message || "Please check your credentials and try again",
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
          title="Welcome back"
          subtitle="Enter your credentials to access your account"
          imageUrl="https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 w-full sm:max-w-md md:max-w-lg mx-auto border rounded-xl p-6 md:p-8 shadow-md  backdrop-blur-sm"
            >
              <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto w-full">
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Input
                            className="h-14 px-4 pr-10 w-full text-base"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            autoComplete="current-password"
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
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3">
                        <FormControl>
                          <Checkbox
                            id="remember-me"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="leading-none">
                          <Label
                            htmlFor="remember-me"
                            className="text-sm cursor-pointer"
                          >
                            Remember me
                          </Label>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
              </div>

              <div className="mt-6 max-w-2xl mx-auto w-full">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                </div>
              </div>
            </form>
          </Form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/80"
            >
              Sign up
            </Link>
          </p>
        </AuthLayout>
      </div>
    </PublicRoute>
  );
}
