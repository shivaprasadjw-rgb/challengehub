"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { Venue } from "@/lib/types";

export default function AdminVenues() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    lat: "",
    lng: ""
  });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated and has SUPER_ADMIN role
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (session?.user?.role !== 'SUPER_ADMIN') {
      if (session?.user?.organizerIds && session.user.organizerIds.length > 0) {
        router.push(`/organizer/${session.user.organizerIds[0].slug}/dashboard`);
      } else {
        router.push('/dashboard');
      }
      return;
    }
    
    setAdminUsername(session.user.name || session.user.email || 'Admin');
    setMounted(true);
  }, [session, status, router]);

  useEffect(() => {
    if (mounted && session?.user?.role === 'SUPER_ADMIN') {
      fetchVenues();
    }
  }, [mounted, session]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/venues');
      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }
      const data = await response.json();
      if (data.success) {
        setVenues(data.venues);
      } else {
        throw new Error(data.error || 'Failed to fetch venues');
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      setNotice('Failed to fetch venues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const resetForm = () => setForm({ name: "", locality: "", city: "", state: "", pincode: "", lat: "", lng: "" });

  const submitAdd = async () => {
    setNotice(null);
    try {
      const res = await fetch('/api/admin/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add venue');
      }
      
      const data = await res.json();
      if (data.success) {
        setNotice('Venue added successfully.');
        setShowAdd(false);
        resetForm();
        fetchVenues();
      } else {
        throw new Error(data.error || 'Failed to add venue');
      }
    } catch (e: any) {
      setNotice(e.message || 'Failed to add venue');
    }
  };

  const beginEdit = (venue: Venue) => {
    setEditingId(venue.id);
    setForm({
      name: venue.name,
      locality: venue.locality,
      city: venue.city,
      state: venue.state,
      pincode: venue.pincode,
      lat: venue.lat?.toString() || '',
      lng: venue.lng?.toString() || '',
    });
  };

  const submitEdit = async () => {
    if (!editingId) return;
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/venues?id=${encodeURIComponent(editingId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update venue');
      }
      
      const data = await res.json();
      if (data.success) {
        setNotice('Venue updated successfully.');
        setEditingId(null);
        resetForm();
        fetchVenues();
      } else {
        throw new Error(data.error || 'Failed to update venue');
      }
    } catch (e: any) {
      setNotice(e.message || 'Failed to update venue');
    }
  };

  const submitDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this venue? This will affect tournaments using this venue.')) return;
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/venues?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete venue');
      }
      
      const data = await res.json();
      if (data.success) {
        setNotice('Venue deleted successfully.');
        fetchVenues();
      } else {
        throw new Error(data.error || 'Failed to delete venue');
      }
    } catch (e: any) {
      setNotice(e.message || 'Failed to delete venue');
    }
  };

  const handleLogout = () => {
    // NextAuth handles logout automatically
    router.push('/auth/login');
  };

  // Show loading while checking session
  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not SUPER_ADMIN
  if (status === 'unauthenticated' || session?.user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Venue Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {adminUsername}</span>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">All Venues</h2>
              <p className="text-sm text-gray-600 mt-1">Total: {loading ? "..." : venues.length} venues</p>
            </div>
            <button onClick={() => { setShowAdd(true); resetForm(); }} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm">
              Add New Venue
            </button>
          </div>

          {notice && (
            <div className="mx-6 mt-3 mb-0 p-3 rounded bg-slate-50 border border-slate-200 text-slate-800 text-sm">{notice}</div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      Loading venues...
                    </td>
                  </tr>
                ) : venues.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No venues found. Add your first venue to get started.
                    </td>
                  </tr>
                ) : (
                  venues.map((venue) => (
                    <tr key={venue.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{venue.locality}, {venue.city}</div>
                        <div className="text-sm text-gray-500">{venue.state} {venue.pincode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => beginEdit(venue)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => submitDelete(venue.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {(showAdd || editingId) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingId ? 'Edit Venue' : 'Add New Venue'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Venue name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Locality</label>
                    <input
                      type="text"
                      value={form.locality}
                      onChange={(e) => setField('locality', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Locality/Area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setField('city', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setField('state', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input
                      type="text"
                      value={form.pincode}
                      onChange={(e) => setField('pincode', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Pincode"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={editingId ? submitEdit : submitAdd}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      {editingId ? 'Update' : 'Add'} Venue
                    </button>
                    <button
                      onClick={() => {
                        setShowAdd(false);
                        setEditingId(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
