"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { UserRound, Users, Stethoscope, Calendar, X, Home, Paperclip, Hospital } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/sidebar-context";
import { Separator } from "./ui/separator";
import { DarkModeToggle } from "./dark-mode";
import { navBar } from "@/utils/constants";



const DashboardNavbar = () => {
  const { isOpen, toggle } = useSidebar();
  const [selected, setSelected] = useState("");
  // console.log('selected :', selected);

  useEffect(() => {
    // console.log(" useEffect called:");
    const pathname = window.location.pathname;
    // console.log("pathname :", pathname);
    setSelected(pathname);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed z-10 flex h-screen flex-col justify-between bg-white shadow-lg transition-all duration-300 ease-in-out dark:bg-slate-800",
          isOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex-1 flex flex-col">
          {/* Logo Section */}
          <div className="py-4">
            <div
              className={cn(
                "flex items-center h-12 px-4",
                "text-slate-700 dark:text-slate-200",
                "transition-all duration-300",
                !isOpen && "justify-center"
              )}
              onClick={toggle}
              role="button"
            >
              <div className="w-6 h-6 flex-shrink-0 ">
                <Stethoscope
                  size={20}
                  className="w-full h-full text-blue-600"
                />
              </div>
              <div
                className={cn(
                  "flex transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
                  isOpen ? "opacity-100 w-auto  ml-3" : "opacity-0 w-0"
                )}
              >
                <span className="text-xl font-bold text-blue-600">Dr.</span>
                <span className="text-xl font-bold text-slate-700 dark:text-white">
                  House AI
                </span>
              </div>
            </div>
          </div>
          <Separator className="border border-gray-200 w-[95%] mx-auto dark:border-gray-700" />

          {/* Navigation Items */}
          <div className="flex flex-col py-4">
            {navBar.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                onClick={() => setSelected(item.url)}
                className={cn(
                  "flex items-center h-12 px-4",
                  "text-slate-700 dark:text-slate-200",
                  "hover:bg-blue-50 dark:hover:bg-slate-700",
                  "transition-all duration-300",
                  {
                    "text-blue-600 bg-blue-50 dark:bg-slate-700":
                      selected === item.url,
                    "justify-center": !isOpen,
                  }
                )}
              >
                <item.icon size={20} />
                {isOpen && (
                  <span className="ml-3 whitespace-nowrap">{item.title}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-auto mb-4">
          <Separator className="border border-gray-200 w-[95%] mx-auto dark:border-gray-700 mb-4" />
          <div
            className={cn(
              "flex items-center h-12 px-4",
              "text-slate-700 dark:text-slate-200",
              "hover:bg-blue-50 dark:hover:bg-slate-700",
              "transition-all duration-300",
              !isOpen && "justify-center"
            )}
          >
            <DarkModeToggle />
          </div>
        </div>
      </nav>
      <button
        onClick={toggle}
        className={cn(
          "fixed z-20 top-7 text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-all duration-300",
          isOpen ? "left-56" : "left-3"
        )}
      >
        <X
          size={20}
          className={cn(
            "absolute top-0 bottom-0 left-0 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}
        />
      </button>
    </>
  );
};

export default DashboardNavbar;
