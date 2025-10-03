'use client'

import { useSession, signOut } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, Home, Trophy, MapPin, Users, Settings } from 'lucide-react'
import Link from 'next/link'

interface OrganizerNavProps {
  currentPage?: string
}

export default function OrganizerNav({ currentPage = 'dashboard' }: OrganizerNavProps) {
  const { data: session } = useSession()
  const params = useParams()
  const organizerSlug = params.slug as string

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' })
  }

  const navigation = [
    { name: 'Dashboard', href: `/organizer/${organizerSlug}/dashboard`, icon: Home, current: currentPage === 'dashboard' },
    { name: 'Tournaments', href: `/organizer/${organizerSlug}/tournaments`, icon: Trophy, current: currentPage === 'tournaments' },
    { name: 'Venues', href: `/organizer/${organizerSlug}/venues`, icon: MapPin, current: currentPage === 'venues' },
    { name: 'Judges', href: `/organizer/${organizerSlug}/judges`, icon: Users, current: currentPage === 'judges' },
    { name: 'Team Members', href: `/organizer/${organizerSlug}/members`, icon: Users, current: currentPage === 'members' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Sports India</h2>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                        item.current
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span>{session?.user?.name || session?.user?.email}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
