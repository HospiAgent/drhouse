"use client";

import { useState } from "react";
import { Microscope, Menu, Settings, MessageCircle, FileText, Search, LogOut, User, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-transform duration-300 md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between border-b px-4 py-2 h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Microscope className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MedAssist AI</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            <NavItem href="/dashboard" icon={<MessageCircle className="h-5 w-5" />} label="Conversations" active />
            <NavItem href="/dashboard/notes" icon={<FileText className="h-5 w-5" />} label="Clinical Notes" />
            <NavItem href="/dashboard/research" icon={<Search className="h-5 w-5" />} label="Research" />
            <NavItem href="/dashboard/analytics" icon={<BarChart3 className="h-5 w-5" />} label="Analytics" />
            <NavItem href="/dashboard/appointments" icon={<Calendar className="h-5 w-5" />} label="Appointments" />
          </nav>
          <Separator className="my-4" />
          <div className="px-4">
            <h3 className="mb-2 text-xs font-semibold text-muted-foreground">Recent Patients</h3>
            <div className="space-y-3">
              <PatientItem name="Sarah Johnson" date="Today" />
              <PatientItem name="Robert Chen" date="Yesterday" />
              <PatientItem name="Maria Garcia" date="Apr 15, 2025" />
              <PatientItem name="David Wilson" date="Apr 12, 2025" />
              <PatientItem name="Emily Taylor" date="Apr 10, 2025" />
            </div>
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/avatar.jpg" alt="Dr. Alex Morgan" />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Dr. Alex Morgan</span>
              <span className="text-xs text-muted-foreground">Cardiology</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/logout">
                  <LogOut className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(true)} 
            className={cn("md:hidden", sidebarOpen && "hidden")}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="ml-auto flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Today's Appointments</span>
                    <span className="sm:hidden">Appointments</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View your schedule for today</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">New Patient</span>
                    <span className="sm:hidden">Patient</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new patient record</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">243</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">598</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Clinical Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">432</div>
                <p className="text-xs text-muted-foreground">+24% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87 hrs</div>
                <p className="text-xs text-muted-foreground">~22 hrs per week</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="assistant">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
                <TabsTrigger value="recent">Recent Conversations</TabsTrigger>
                <TabsTrigger value="templates">Note Templates</TabsTrigger>
              </TabsList>
              <TabsContent value="assistant">
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle>Medical AI Assistant</CardTitle>
                    <CardDescription>
                      Start a new conversation or patient session with your AI assistant.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg h-64 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="mt-1">
                            <AvatarImage src="/avatar.jpg" alt="Dr. Alex Morgan" />
                            <AvatarFallback>AM</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Dr. Alex Morgan</span>
                              <span className="text-xs text-muted-foreground">11:42 AM</span>
                            </div>
                            <p className="text-sm">Begin patient consultation for Sarah Johnson.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Avatar className="mt-1 bg-primary text-primary-foreground">
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">MedAssist AI</span>
                              <span className="text-xs text-muted-foreground">11:42 AM</span>
                            </div>
                            <p className="text-sm">
                              Starting consultation for Sarah Johnson. I'll transcribe and analyze your conversation. What would you like to discuss today?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isRecording ? (
                        <Button 
                          className="bg-primary text-primary-foreground" 
                          onClick={() => setIsRecording(true)}
                        >
                          Start Recording
                        </Button>
                      ) : (
                        <Button 
                          className="bg-destructive text-destructive-foreground" 
                          onClick={() => setIsRecording(false)}
                        >
                          Stop Recording
                        </Button>
                      )}
                      <Input placeholder="Type your message..." className="flex-1" />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Generate Note</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[625px]">
                          <DialogHeader>
                            <DialogTitle>Generate Clinical Note</DialogTitle>
                            <DialogDescription>
                              Create a structured clinical note from this conversation.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Textarea 
                                placeholder="The system will generate a structured clinical note based on the conversation. You can edit it before saving."
                                className="min-h-[200px]"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button>Save Note</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {isRecording && (
                      <div className="flex items-center justify-center p-2 bg-destructive/10 rounded-lg text-destructive animate-pulse">
                        Recording in progress... 00:25
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="recent">
                <div className="grid gap-4 md:grid-cols-2">
                  <ConversationCard 
                    patientName="Sarah Johnson"
                    date="Today, 11:42 AM"
                    excerpt="Chief complaint: Chest pain and shortness of breath for the past 3 days."
                    tags={["Cardiology", "Follow-up"]}
                  />
                  <ConversationCard 
                    patientName="Robert Chen"
                    date="Yesterday, 3:15 PM"
                    excerpt="Discussing recent lab results and medication adjustments for hypertension management."
                    tags={["Medication Review", "Hypertension"]}
                  />
                  <ConversationCard 
                    patientName="Maria Garcia"
                    date="Apr 15, 2025"
                    excerpt="Post-surgical follow-up for coronary artery bypass graft performed 2 weeks ago."
                    tags={["Post-op", "CABG"]}
                  />
                  <ConversationCard 
                    patientName="David Wilson"
                    date="Apr 12, 2025"
                    excerpt="Initial consultation for heart palpitations and fatigue over the past month."
                    tags={["Initial Consult", "Arrhythmia"]}
                  />
                </div>
              </TabsContent>
              <TabsContent value="templates">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">SOAP Note</CardTitle>
                      <CardDescription>Standard medical documentation format</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Structured format with Subjective, Objective, Assessment, and Plan sections.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Use Template</Button>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cardiology Consult</CardTitle>
                      <CardDescription>Specialized for cardiac patients</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Includes cardiac-specific examination fields and common cardiac conditions.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Use Template</Button>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Follow-up Visit</CardTitle>
                      <CardDescription>For returning patients</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Focused on changes since last visit, medication reviews, and treatment adjustments.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Use Template</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ 
  href, 
  icon, 
  label, 
  active = false 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string;
  active?: boolean;
}) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
        active && "bg-muted"
      )}
    >
      <div className={cn("text-muted-foreground", active && "text-foreground")}>
        {icon}
      </div>
      <span className={cn("text-muted-foreground", active && "text-foreground")}>
        {label}
      </span>
    </Link>
  );
}

function PatientItem({ name, date }: { name: string; date: string }) {
  return (
    <Link href="#" className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted transition-colors">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
    </Link>
  );
}

function ConversationCard({ 
  patientName, 
  date, 
  excerpt, 
  tags 
}: { 
  patientName: string; 
  date: string;
  excerpt: string;
  tags: string[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{patientName}</CardTitle>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="bg-muted/50">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="ghost" size="sm">
          View
        </Button>
        <Button variant="ghost" size="sm">
          Generate Note
        </Button>
      </CardFooter>
    </Card>
  );
}