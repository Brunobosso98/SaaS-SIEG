
import { SidebarProvider, Sidebar, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarRail />
        <div className="flex-1 p-8">
          <header className="flex justify-end items-center mb-8">
            <ThemeToggle />
          </header>
          <main className="animate-fade-in">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
