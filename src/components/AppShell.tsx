"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import EmailToast from "@/components/EmailToast";
import RouteGuard from "@/components/RouteGuard";
import AIFloatingAssistant from "@/components/AIFloatingAssistant";
import { AppProvider } from "@/lib/context";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return <>{children}</>;

  return (
    <AppProvider>
      <Sidebar />
      <main className="lg:pl-64 min-h-screen">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
          <RouteGuard>{children}</RouteGuard>
        </div>
      </main>
      <EmailToast />
      <AIFloatingAssistant />
    </AppProvider>
  );
}
