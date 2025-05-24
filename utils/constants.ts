import { UserRound, Users, Calendar, Home, BarChart, Microscope, Paperclip, Hospital, Pill, ListCheck } from "lucide-react";

interface NavItem {
  url: string;
  icon: any; // Using any for Lucide icons
  title: string;
  description: string;
}

export const navBar: NavItem[] = [
  {
    url: "/dashboard",
    icon: Home,
    title: "Dashboard",
    description: "Welcome to DR.House AI - Your medical assistant",
  },
  {
    url: "/dashboard/assessments",
    icon: Microscope,
    title: "Assessments",
    description: "Assess and analyze patient data",
  },
  {
    url: "/dashboard/appointments",
    icon: Calendar,
    title: "Appointments",
    description: "Schedule and manage patient appointments",
  },
  {
    url: "/dashboard/patients",
    icon: Users,
    title: "Patients",
    description: "Manage and monitor your patients",
  },
  {
    url: "/dashboard/profile",
    icon: UserRound,
    title: "Profile",
    description: "Manage your account settings",
  },
  {
    url: "/dashboard/doc-analysis",
    icon: UserRound,
    title: "Document Analysis",
    description: "Analyze medical documents with AI",
  },
  //   {
  //     url: "/dashboard/analytics",
  //     icon: BarChart,
  //     title: "Analytics",
  //     description: "View insights and performance metrics",
  //   },
];

// Helper function to get page info from URL
export const getPageInfo = (pathname: string) => {
  const route = navBar.find((item) => item.url === pathname);
  return route;
};


interface AssessmentOption {
  title: string;
  description: string;
  icon: any;
}

export const assessmentOptions: AssessmentOption[] = [
  {
    title: "Summarize Consultation",
    description: "Generate a brief overview of key points.",
    icon: Hospital,
  },
  {
    title: "Draft SOAP Note",
    description: "Create a structured SOAP note from audio.",
    icon: Paperclip,
  },
  {
    title: "Identify Symptoms",
    description: "Extract and list patient-reported symptoms.",
    icon: ListCheck,
  },
  {
    title: "Check Drug Interactions",
    description: "Analyze potential medication conflicts.",
    icon: Pill,
  },
];

export const disclaimer = "Dr.House AI can make mistakes. Consider checking important information.";