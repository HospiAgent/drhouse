"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import axios from "axios";
import { formatDate, getInitials } from "@/utils/helper";



const GridView = ({ patients }: { patients: any }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map((patient: any) => (
        <Card key={patient.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {getInitials(patient.name)}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">{patient.name}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {patient.contact}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Age
                </p>
                <p className="text-sm">{patient.age || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <Badge
                  variant={patient.status === "active" ? "default" : "secondary"}
                >
                  {patient.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Medical History
                </p>
                <p className="text-sm">{patient.medical_history || 'None'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Visit
                </p>
                <p className="text-sm">{formatDate(patient.last_visit)}</p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm truncate">{patient.email}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ListView = ({ patients }: { patients: any }) => {
  return (
    <Card>
      <ScrollArea className="h-[600px]">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Patient
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Contact
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Medical History
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Visit
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient: any) => (
              <tr
                key={patient.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {getInitials(patient.name)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {patient.gender || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">{patient.contact}</td>
                <td className="p-4">
                  <Badge
                    variant={patient.status === "active" ? "default" : "secondary"}
                  >
                    {patient.status}
                  </Badge>
                </td>
                <td className="p-4">{patient.medical_history || 'None'}</td>
                <td className="p-4">{formatDate(patient.last_visit)}</td>
                <td className="p-4 max-w-[200px] truncate">{patient.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </Card>
  );
};

export default function PatientDatabase() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedVisit, setSelectedVisit] = React.useState("any");
  const [selectedDepartment, setSelectedDepartment] = React.useState("all");
  const [selectedAge, setSelectedAge] = React.useState("all");
  const [viewMode, setViewMode] = React.useState("grid"); // grid or list

  const [patients, setPatients] = React.useState([]);

  // Mock patient data
  // const patients = [
  //   {
  //     id: "PT12345",
  //     name: "Sophia Carter",
  //     age: 35,
  //     condition: "Hypertension",
  //     status: "active",
  //     lastVisit: "3 days ago",
  //     nextAppointment: "Oct 15, 2023",
  //     assignedDoctor: "Dr. Emily White",
  //     initials: "SC",
  //   },
  //   {
  //     id: "PT67890",
  //     name: "Liam Bennett",
  //     age: 42,
  //     condition: "Migraine",
  //     status: "pending",
  //     lastVisit: "1 week ago",
  //     nextAppointment: "Nov 02, 2023",
  //     assignedDoctor: "Dr. David Green",
  //     initials: "LB",
  //   },
  //   {
  //     id: "PT11223",
  //     name: "Olivia Hayes",
  //     age: 28,
  //     condition: "Asthma",
  //     status: "active",
  //     lastVisit: "2 days ago",
  //     nextAppointment: null,
  //     assignedDoctor: "Dr. Sarah Brown",
  //     initials: "OH",
  //   },
  // ];

  useEffect(() => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://hospital-be-q56g.onrender.com/get/patients?doctor_id=4",
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        console.log(response.data);
        setPatients(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative flex items-center">
            <Search className="absolute left-3 z-10 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search with AI..."
              className="pl-10 pr-24 h-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="absolute right-0 h-full rounded-l-none px-4 hover:bg-primary/90">
              Search
            </Button>
          </div>
        </div>
        <div className="flex-none ">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[140px] h-10 ">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid View</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium dark:text-gray-300">
            Status:
          </span>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Patients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium dark:text-gray-300">Visit:</span>
          <Select value={selectedVisit} onValueChange={setSelectedVisit}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Any Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium dark:text-gray-300">
            Department:
          </span>
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
              <SelectItem value="pediatrics">Pediatrics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium dark:text-gray-300">Age:</span>
          <Select value={selectedAge} onValueChange={setSelectedAge}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Ages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              <SelectItem value="0-18">0-18</SelectItem>
              <SelectItem value="19-40">19-40</SelectItem>
              <SelectItem value="41+">41+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" className="ml-auto">
          Clear All Filters
        </Button>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="px-3 py-1">
          Status: Active
          <button className="ml-2 hover:text-primary">×</button>
        </Badge>
        <Badge variant="secondary" className="px-3 py-1">
          Department: Cardiology
          <button className="ml-2 hover:text-primary">×</button>
        </Badge>
      </div>
      {/* Patient Cards */}
      {viewMode === "grid" ? (
        <GridView patients={patients} />
      ) : (
        <ListView patients={patients} />
      )}
    </div>
  );
}
