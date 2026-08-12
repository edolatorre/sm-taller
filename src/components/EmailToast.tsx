"use client";

import { useApp } from "@/lib/context";
import { Mail, X } from "lucide-react";

export default function EmailToast() {
  const { lastEmail, clearLastEmail } = useApp();

  if (!lastEmail) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-md w-full sm:w-96 animate-in slide-in-from-bottom-4">
      <div className="card shadow-xl border-brand-blue/30 p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-brand-blue">
            <Mail size={18} />
            <span className="font-semibold text-sm">Correo enviado (demo)</span>
          </div>
          <button
            onClick={clearLastEmail}
            className="text-brand-grey hover:text-brand-dark"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-brand-grey mb-1">
          Para: <span className="text-brand-dark">{lastEmail.para}</span>
        </p>
        <p className="text-sm font-medium mb-2">{lastEmail.asunto}</p>
        <pre className="text-xs text-brand-grey bg-gray-50 rounded-lg p-3 whitespace-pre-wrap max-h-32 overflow-y-auto border border-brand-border">
          {lastEmail.cuerpo}
        </pre>
        <p className="text-[10px] text-brand-grey mt-2">
          En producción se enviaría vía SMTP. Demo simula el envío.
        </p>
      </div>
    </div>
  );
}
