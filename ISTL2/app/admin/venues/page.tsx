"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Venue } from "@/lib/types";

export default function AdminVenues() {
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
  const router = useRouter();

  useEffect(() => {
    const sessionId = localStorage.getItem("adminSessionId");
    const username = localStorage.getItem("adminUsername");
    if (!sessionId || !username) {
      router.push("/admin/login");
      return;
    }
    setAdminUsername(username);
    setMounted(true);
  }, [router]);

  useEffect(() => {
    if (mounted) {
      fetchVenues();
    }
  }, [mounted]);

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/admin/venues');
      const data = await response.json();
      if (data.success) setVenues(data.venues);
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const setField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const resetForm = () => setForm({ name: "", locality: "", city: "", state: "", pincode: "", lat: "", lng: "" });

  const submitAdd = async () => {
    setNotice(null);
    try {
      const sessionId = localStorage.getItem("adminSessionId");
      if (!sessionId) {
        setNotice('No active session found. Please log in again.');
        return;
      }

      const res = await fetch('/api/admin/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to add venue');
      setNotice('Venue added successfully.');
      setShowAdd(false);
      resetForm();
      fetchVenues();
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
      const sessionId = localStorage.getItem("adminSessionId");
      if (!sessionId) {
        setNotice('No active session found. Please log in again.');
        return;
      }

      const res = await fetch(`/api/admin/venues?id=${encodeURIComponent(editingId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update venue');
      setNotice('Venue updated successfully.');
      setEditingId(null);
      resetForm();
      fetchVenues();
    } catch (e: any) {
      setNotice(e.message || 'Failed to update venue');
    }
  };

  const submitDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this venue? This will affect tournaments using this venue.')) return;
    setNotice(null);
    try {
      const sessionId = localStorage.getItem("adminSessionId");
      if (!sessionId) {
        alert('No active session found. Please log in again.');
        return;
      }
      const res = await fetch(`/api/admin/venues?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete venue');
      setNotice('Venue deleted successfully.');
      fetchVenues();
    } catch (e: any) {
      setNotice(e.message || 'Failed to delete venue');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSessionId");
    localStorage.removeItem("adminUsername");
    router.push("/admin/login");
  };

  if (!mounted) return null;

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {venues.map((venue) => (
                  <tr key={venue.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                        <div className="text-sm text-gray-500">ID: {venue.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{venue.locality}, {venue.city}</div>
                        <div className="text-gray-500">{venue.state} - {venue.pincode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venue.lat && venue.lng ? (
                        <div>
                          <div>Lat: {venue.lat}</div>
                          <div>Lng: {venue.lng}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button onClick={() => beginEdit(venue)} className="text-sky-600 hover:text-sky-700">Edit</button>
                        <button onClick={() => submitDelete(venue.id)} className="text-red-600 hover:text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {venues.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No venues found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Venue Modal */}
        {(showAdd || editingId) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">
                {editingId ? 'Edit Venue' : 'Add New Venue'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter venue name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                  <input
                    type="text"
                    value={form.locality}
                    onChange={(e) => setField('locality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter locality"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setField('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setField('pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter pincode"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="text"
                      value={form.lat}
                      onChange={(e) => setField('lat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="text"
                      value={form.lng}
                      onChange={(e) => setField('lng', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingId ? submitEdit : submitAdd}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  {editingId ? 'Update Venue' : 'Add Venue'}
                </button>
                <button
                  onClick={() => { setShowAdd(false); setEditingId(null); resetForm(); }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
