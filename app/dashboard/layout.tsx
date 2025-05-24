"use client";
import DashboardNavbar from "@/components/dashboard-navbar";
import { SidebarProvider, useSidebar } from "@/context/sidebar-context";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { getPageInfo } from "@/utils/constants";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <DashboardNavbar />

      <main className={cn("flex-1 transition-all duration-300", isOpen ? "ml-64" : "ml-16")}>
        <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-all duration-300">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {pageInfo?.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pageInfo?.description}
          </p>
        </div>
        <div
          className={cn(
            "flex-1 px-4 py-8 sm:px-6 lg:px-8 transition-all duration-300",
          )}
        >
          {children}
        </div>
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
