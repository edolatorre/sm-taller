import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import EmailToast from "@/components/EmailToast";
import RouteGuard from "@/components/RouteGuard";
import AIFloatingAssistant from "@/components/AIFloatingAssistant";
import { AppProvider } from "@/lib/context";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SM-EM | Gestión de Taller",
  description:
    "Plataforma de gestión para taller de maquinaria pesada - Servicios Mineros Equipos y Maquinarias",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
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
      </body>
    </html>
  );
}
