'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SuperAdminNavProps {
  currentPage?: string
}

export default function SuperAdminNav({ currentPage = 'dashboard' }: SuperAdminNavProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const navItems = [
    { href: '/super-admin', label: 'Dashboard', key: 'dashboard' },
    { href: '/super-admin/organizers', label: 'Organizers', key: 'organizers' },
    { href: '/super-admin/analytics', label: 'Analytics', key: 'analytics' }
  ]

  const isActive = (href: string) => {
    if (href === '/super-admin') {
      return pathname === '/super-admin'
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/super-admin">
                <h1 className="text-xl font-semibold text-gray-900 hover:text-gray-700">
                  Super Admin
                </h1>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(item.href)
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700">
              Welcome, {session?.user?.name || 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}

interface BreadcrumbProps {
  items: { label: string; href?: string }[]
}

export function SuperAdminBreadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && <span className="text-gray-400 mx-2">/</span>}
            {item.href ? (
              <Link href={item.href} className="text-gray-700 hover:text-gray-900">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-500">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
