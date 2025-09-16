'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tournament {
  id: string;
  title: string;
  sport: string;
  date: string;
  status: string;
  maxParticipants: number;
  currentParticipants: number;
  venue?: {
    name: string;
    address: string;
  };
}

export default function AdminTournaments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

    fetchTournaments();
  }, [session, status, router]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/admin/tournaments');
      if (response.ok) {
        const data = await response.json();
        setTournaments(data.tournaments || []);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
        <Link
          href="/admin/tournaments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Tournament
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tournaments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filteredTournaments.length} Tournament{filteredTournaments.length !== 1 ? 's' : ''}
          </h3>
        </div>
        
        {filteredTournaments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No tournaments found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTournaments.map((tournament) => (
              <div key={tournament.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {tournament.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tournament.status)}`}>
                        {tournament.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="mr-4">Sport: {tournament.sport}</span>
                      <span className="mr-4">Date: {new Date(tournament.date).toLocaleDateString()}</span>
                      <span>Participants: {tournament.currentParticipants}/{tournament.maxParticipants}</span>
                    </div>
                    {tournament.venue && (
                      <div className="mt-1 text-sm text-gray-500">
                        Venue: {tournament.venue.name} - {tournament.venue.address}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/tournaments/${tournament.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/tournaments/${tournament.id}/edit`}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
