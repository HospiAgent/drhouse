"use client";

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { getUserData } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Brain, 
  BarChart3, 
  SearchCode, 
  ClipboardSignature
} from 'lucide-react';

function ProfileDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Profile
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Title</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value='Dr.'
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Name</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={`${user.name}`}
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Email ID</label>
              <input
                className="w-full border rounded-lg p-2"
                value={user.email}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Organization</label>
              <input
                className="w-full border rounded-lg p-2"
                value={user.organization ?? ''}
                readOnly
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setIsOpen(false)} className="bg-blue-500 hover:bg-blue-600 text-white">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
  
  
  useEffect(() => {
    const token = localStorage.getItem('drhouse_auth_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserData(decoded);
      } catch (e) {
        console.error('Invalid token', e);
      }
    }
  }, []);
  const handleNewPatientClick = () => {
    const token = localStorage.getItem('drhouse_auth_token');
    router.push(`/patient?token=${encodeURIComponent(token ?? '')}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
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
              {userData && <ProfileDropdown user={userData} />}
            </div>
          </header>

          <div className="relative mb-16 flex justify-center items-center">
            {/* Background Icon */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-10">
              <ClipboardSignature size={240} className="text-blue-200" />
            </div>
          
            {/* Foreground Card */}
            <div className="relative bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow text-center max-w-3xl w-full z-10 transform hover:-translate-y-1 duration-300">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Generate Notes with Dr.House AI</h2>
              <p className="text-gray-700 mb-6 text-lg">
                Record your conversation with patient and leave it all to Dr.House AI to generate SOAP documents and summarize your conversation for easy access.
              </p>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-lg transition-colors duration-200" onClick={handleNewPatientClick}>
                Start Assessment
              </Button>
            </div>
          </div>

          {/* Future Features Section */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Premium Features Coming Soon</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">Unlock the full potential of your practice with our upcoming premium features designed to streamline workflows and enhance patient care.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* AI Medical Scribe Card */}
              <div className="bg-white/30 backdrop-blur-md border border-white/40 p-8 rounded-3xl shadow-lg flex flex-col transition-all hover:shadow-xl hover:bg-white/40 hover:translate-y-[-4px] duration-300">
                <p className="text-blue-500 font-medium mb-2">Accelerate Documentation</p>
                <h3 className="font-bold text-2xl mb-5">Multilingual AI Medical Scribe</h3>
                
                <div className="flex flex-col flex-grow">
                  <div className="bg-white/80 rounded-xl shadow-md mb-5 w-full h-36 flex items-center justify-center text-blue-500">
                    <ClipboardSignature size={64} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-gray-700 mb-6">Accuracy that converts even the most complex multi-party medical conversations into comprehensive clinical notes in real-time. Save hours of documentation time while improving note quality.</p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Premium Feature
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Advanced Analytics Card */}
              <div className="bg-white/30 backdrop-blur-md border border-white/40 p-8 rounded-3xl shadow-lg flex flex-col transition-all hover:shadow-xl hover:bg-white/40 hover:translate-y-[-4px] duration-300">
                <p className="text-blue-500 font-medium mb-2">Data-Driven Decisions</p>
                <h3 className="font-bold text-2xl mb-5">Advanced Medical Analytics</h3>
                
                <div className="flex flex-col flex-grow">
                  <div className="bg-white/80 rounded-xl shadow-md mb-5 w-full h-36 flex items-center justify-center text-blue-500">
                    <Brain size={64} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-gray-700 mb-6">Comprehensive analytics and custom report generation that transform raw clinical data into actionable practice insights. Identify trends and improve patient outcomes with data-driven intelligence.</p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Premium Feature
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Research Card */}
              <div className="bg-white/30 backdrop-blur-md border border-white/40 p-8 rounded-3xl shadow-lg flex flex-col transition-all hover:shadow-xl hover:bg-white/40 hover:translate-y-[-4px] duration-300">
                <p className="text-blue-500 font-medium mb-2">Evidence-Based Care</p>
                <h3 className="font-bold text-2xl mb-5">AI Medical Research Assistant</h3>
                
                <div className="flex flex-col flex-grow">
                  <div className="bg-white/80 rounded-xl shadow-md mb-5 w-full h-36 flex items-center justify-center text-blue-500">
                    <SearchCode size={64} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-gray-700 mb-6">Cutting-edge AI analytics that automatically scans the latest medical research and provides personalized treatment recommendations based on patient-specific factors.</p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Premium Feature
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}