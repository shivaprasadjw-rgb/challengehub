"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading while checking session
  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  // If authenticated but not SUPER_ADMIN, redirect to appropriate dashboard
  if (session?.user && session.user.role !== 'SUPER_ADMIN') {
    if (session.user.organizerIds?.length > 0) {
      router.push(`/organizer/${session.user.organizerIds[0].slug}/dashboard`);
    } else {
      router.push('/dashboard');
    }
    return null;
  }

  // If authenticated and SUPER_ADMIN, show admin content
  if (session?.user?.role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  // Fallback loading
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying permissions...</p>
      </div>
    </div>
  );
}
