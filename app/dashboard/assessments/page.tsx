"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assessmentOptions, disclaimer } from "@/utils/constants";
import { MicIcon, Paperclip, Send, Search } from "lucide-react";
import { useState } from "react";

const recentPatients = [
  { id: "JD", name: "John Doe", lastVisit: "12/05/2024" },
  { id: "AS", name: "Alice Smith", lastVisit: "10/05/2024" },
  { id: "RB", name: "Robert Brown", lastVisit: "08/05/2024" },
  { id: "EJ", name: "Emily Jones", lastVisit: "05/05/2024" },
  { id: "MJ", name: "Michael Johnson", lastVisit: "02/05/2024" },
];

export default function AssessmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Welcome Dr. Carter!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          You can start by recording a patient conversation, uploading an audio
          file, or typing in details. How can Dr.House AI assist you today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {assessmentOptions.map((option) => (
          <Card
            key={option.title}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <option.icon />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{option.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center items-center my-12">
        <Button
          className="h-14 rounded-full px-6 text-lg font-medium"
          onClick={() => setIsModalOpen(true)}
        >
          <MicIcon className="w-6 h-6 mr-3" />
          Start Assessment
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">New Patient</TabsTrigger>
              <TabsTrigger value="existing">Existing Patient</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-4">
              <DialogHeader>
                <DialogTitle>New Patient Assessment</DialogTitle>
                <DialogDescription>
                  Fill in the patient details to start a new assessment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter patient's full name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="patient.email@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button>Add Patient</Button>
              </div>
            </TabsContent>

            <TabsContent value="existing" className="mt-4">
              <DialogHeader>
                <DialogTitle>Existing Patient</DialogTitle>
                <DialogDescription>
                  Search for an existing patient to continue.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="relative mb-6">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients by name or ID..."
                    className="pl-8"
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Recent Patients
                  </p>
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer group"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        {patient.id}
                      </div>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last Visit: {patient.lastVisit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
        {disclaimer}
      </p>
    </div>
  );
}
