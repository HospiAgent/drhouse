"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    medicalHistory: "",
    allergies: "",
    preferences: {
      notifications: true,
      dataSharing: false,
      language: "english"
    }
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      // Save data and redirect
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Step {step} of {totalSteps}</p>
          </div>

          {/* Welcome - Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Dr. House</h1>
              <p className="text-gray-600 dark:text-gray-300">Let's get to know you better to provide personalized medical assistance.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="dark:text-gray-200">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="dark:text-gray-200">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter your age"
                    className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Medical History - Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Medical Information</h1>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="dark:text-gray-200">Gender</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange({ target: { name: 'gender', value } })}
                    className="dark:text-gray-200"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="dark:text-gray-200">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="dark:text-gray-200">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="dark:text-gray-200">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory" className="dark:text-gray-200">Medical History</Label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="List any significant medical conditions or surgeries"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Allergies - Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Allergies & Medications</h1>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies" className="dark:text-gray-200">Allergies</Label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="List any allergies to medications or substances"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preferences - Step 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Preferences</h1>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="dark:text-gray-200">Enable Notifications</Label>
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    className="h-4 w-4 dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="dark:text-gray-200">Allow Anonymous Data Sharing</Label>
                  <input
                    type="checkbox"
                    checked={formData.preferences.dataSharing}
                    onChange={(e) => handlePreferenceChange('dataSharing', e.target.checked)}
                    className="h-4 w-4 dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-200">Preferred Language</Label>
                  <select
                    value={formData.preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button onClick={handleNext}>
              {step === totalSteps ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}