import React from "react";

export function AuthLayout({ children, title, subtitle, imageUrl }) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter: "sepia(30%) hue-rotate(190deg) brightness(85%) contrast(110%)",
              }}
            />
          )}
          <div className="absolute inset-0 bg-primary/60" />
        </div>
        <div className="relative z-10 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Dr House
        </div>
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Dr House has completely transformed how I document patient encounters. I save at least an hour every day on paperwork, giving me more time with patients."
            </p>
            <footer className="text-sm">Dr. Bhavesh Khan, Cardiologist</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}