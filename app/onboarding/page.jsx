"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useRouter } from "next/navigation";
export default function ProductHighlightPage() {
  
  const router = useRouter()
  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Dr. House
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Your intelligent medical assistant for accurate diagnostics and treatment plans
          </p>
        </div>

        {/* 3 Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Point 1 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">AI-Powered Diagnostics</h3>
            <p className="text-gray-600 text-lg">
              Our advanced algorithms analyze symptoms with 95% accuracy, reducing misdiagnosis and improving patient outcomes.
            </p>
          </div>

          {/* Point 2 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">24/7 Availability</h3>
            <p className="text-gray-600 text-lg">
              Instant access to medical expertise anytime, anywhere - no more waiting for appointments for preliminary assessments.
            </p>
          </div>

          {/* Point 3 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Evidence-Based</h3>
            <p className="text-gray-600 text-lg">
              Recommendations backed by the latest medical research and continuously updated clinical guidelines.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
            <Button className="h-14 px-12 text-lg font-medium" onClick={() => router.push('/dashboard')}>
              Continue to Dashboard
            </Button>
          
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}