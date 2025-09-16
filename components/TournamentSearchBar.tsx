'use client'

import { useState } from 'react'

interface SearchBarProps {
  onLocationChange: (value: string) => void
  onSportChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export default function SearchBar({ onLocationChange, onSportChange, onStatusChange }: SearchBarProps) {
  const [location, setLocation] = useState('all')
  const [sport, setSport] = useState('all')
  const [status, setStatus] = useState('all')

  const handleLocationChange = (value: string) => {
    setLocation(value)
    onLocationChange(value)
  }

  const handleSportChange = (value: string) => {
    setSport(value)
    onSportChange(value)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onStatusChange(value)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Tournaments</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Location Filter */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Locations</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Delhi">Delhi</option>
            <option value="Chennai">Chennai</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
          </select>
        </div>

        {/* Sport Filter */}
        <div>
          <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
            Sport
          </label>
          <select
            id="sport"
            value={sport}
            onChange={(e) => handleSportChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Sports</option>
            <option value="Badminton">Badminton</option>
            <option value="Tennis">Tennis</option>
            <option value="Chess">Chess</option>
            <option value="Carrom">Carrom</option>
            <option value="Table Tennis">Table Tennis</option>
            <option value="Cricket">Cricket</option>
            <option value="Football">Football</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  )
}
