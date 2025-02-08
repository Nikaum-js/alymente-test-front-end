'use client'
import { Nav } from './nav'
import { ChevronLeft, ChevronRight, UsersRound } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from './button'

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 720)
      if (window.innerWidth < 720) {
        setIsCollapsed(true)
      }
    }

    checkScreenSize()

    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div className="relative min-w-[60px] border-r px-3 pb-10 pt-24">
      <div className="absolute right-[-20px] top-7">
        <Button
          variant="secondary"
          className={`rounded-full p-2 ${isMobile ? 'hidden' : ''}`}
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </div>
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: 'Pessoas',
            href: '/',
            icon: UsersRound,
            variant: 'default',
          },
        ]}
      />
    </div>
  )
}