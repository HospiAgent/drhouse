
"use client";
import DashboardNavbar from "@/components/dashboard-navbar";
import { SidebarProvider, useSidebar } from "@/context/sidebar-context";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <DashboardNavbar />
      <main
        className={cn(
          "flex-1 px-4 py-8 sm:px-6 lg:px-8 transition-all duration-300",
          isOpen ? "ml-64" : "ml-16"
        )}
      >
        {children}
      </main>
    </div>
  );
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;
