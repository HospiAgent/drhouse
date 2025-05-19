"use client";

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { getUserData } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const user = getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex justify-between items-center mb-8 pb-4 border-b">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              {userData && (
                <p className="text-gray-600 mt-1">
                  Welcome, Dr. {userData.firstName} {userData.lastName}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/profile')}>
                Profile
              </Button>
              <Button variant="outline" onClick={() => router.push('/settings')}>
                Settings
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Patients</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Appointments</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Reports</span>
                  <span className="font-medium">3</span>
                </div>
              </div>
            </div>

            {/* Recent Patients */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Patients</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    JD
                  </div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-500">Checkup at 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                    AS
                  </div>
                  <div>
                    <p className="font-medium">Alice Smith</p>
                    <p className="text-sm text-gray-500">Follow-up at 11:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                    RJ
                  </div>
                  <div>
                    <p className="font-medium">Robert Johnson</p>
                    <p className="text-sm text-gray-500">Consultation at 2:15 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button className="w-full">New Patient</Button>
                <Button className="w-full">Schedule</Button>
                <Button className="w-full">Prescriptions</Button>
                <Button className="w-full">Reports</Button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Appointment completed</p>
                  <p className="text-sm text-gray-500">You completed an appointment with John Doe</p>
                  <p className="text-xs text-gray-400 mt-1">Today, 10:30 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Prescription issued</p>
                  <p className="text-sm text-gray-500">You issued a prescription for Alice Smith</p>
                  <p className="text-xs text-gray-400 mt-1">Today, 9:15 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Lab results received</p>
                  <p className="text-sm text-gray-500">Lab results for Robert Johnson have been received</p>
                  <p className="text-xs text-gray-400 mt-1">Yesterday, 4:45 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
