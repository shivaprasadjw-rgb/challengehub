'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminRegistrations() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }
    
    if (session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/admin/login');
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Registration management functionality will be implemented here.</p>
        <div className="mt-4">
          <Link
            href="/admin/registrations/bulk"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-2"
          >
            Bulk Import
          </Link>
          <Link
            href="/admin/excel-upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Excel Upload
          </Link>
        </div>
      </div>
    </div>
  );
}
