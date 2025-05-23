"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Stethoscope, Users, ClipboardCheck, Activity } from "lucide-react";

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("drhouse_auth_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserData(decoded);
      } catch (e) {
        console.error("Invalid token", e);
      }
    }
  }, []);

  const handleNewPatientClick = () => {
    router.push("/patient");
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {userData?.name ? `Dr. ${userData.name}` : "Doctor"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Here's an overview of your medical practice
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Patients
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  127
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Diagnoses Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  12
                </p>
              </div>
              <Stethoscope className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  94%
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Reports Generated
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  256
                </p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="flex gap-4">
            <Button
              onClick={handleNewPatientClick}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              New Patient
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/diagnoses")}
              className="border-blue-500 text-blue-500"
            >
              View Diagnoses
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
