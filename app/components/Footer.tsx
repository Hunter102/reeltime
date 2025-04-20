'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { name: 'Home', path: '/' },
  { name: 'People', path: '/people' },
  { name: 'DailyFeed', path: '/dailyFeed' },
  { name: 'Groups', path: '/groups' },
  { name: 'Profile', path: '/profile' },
]

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer className="footer">
      {tabs.map(tab => (
        <Link key={tab.path} href={tab.path}>
          <span className={pathname === tab.path ? 'active' : ''}>
            {tab.name}
          </span>
        </Link>
      ))}
    </footer>
  )
}
