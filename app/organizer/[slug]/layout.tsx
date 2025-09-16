"use client";

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [organizer, setOrganizer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Check if user has access to this organizer
    const hasAccess = session.user.organizerIds?.some(
      (org: any) => org.slug === slug
    );

    if (!hasAccess) {
      router.push('/');
      return;
    }

    fetchOrganizer();
  }, [session, status, router, slug]);

  const fetchOrganizer = async () => {
    try {
      const response = await fetch(`/api/organizer/${slug}`);
      const data = await response.json();
      if (data.success) {
        setOrganizer(data.organizer);
      }
    } catch (error) {
      console.error('Failed to fetch organizer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !organizer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {organizer.name} Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {session.user.name}</span>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          <nav className="w-64">
            <div className="space-y-1">
              <Link
                href={`/organizer/${slug}/dashboard`}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Dashboard
              </Link>
              <Link
                href={`/organizer/${slug}/tournaments`}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Tournaments
              </Link>
              <Link
                href={`/organizer/${slug}/venues`}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Venues
              </Link>
              <Link
                href={`/organizer/${slug}/judges`}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Judges
              </Link>
              <Link
                href={`/organizer/${slug}/members`}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Members
              </Link>
            </div>
          </nav>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
