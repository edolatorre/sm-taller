"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { getRutaInicio } from "@/lib/permissions";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, canAccessPath, permisosPorRol } = useApp();

  useEffect(() => {
    if (!canAccessPath(pathname)) {
      router.replace(getRutaInicio(currentUser, permisosPorRol));
    }
  }, [pathname, currentUser, canAccessPath, permisosPorRol, router]);

  if (!canAccessPath(pathname)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-brand-grey">Redirigiendo...</p>
      </div>
    );
  }

  return <>{children}</>;
}
