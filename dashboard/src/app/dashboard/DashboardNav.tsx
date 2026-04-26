"use client"
 
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Package, Shield, Globe, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const links = [
    { href: "/dashboard/sites", label: "Sites", icon: Globe },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/builder", label: "Promo Builder", icon: LayoutGrid },
  ]
 
  if (role === "ADMIN") {
    links.push({ href: "/dashboard/users", label: "Users", icon: Shield })
  }
 
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex gap-1 ml-8 text-sm font-semibold">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname.startsWith(link.href)
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive 
                ? "bg-primary/10 text-primary" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-slate-400"}`} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden ml-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 h-11 w-11"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Off-canvas Overlay & Sidebar using Portal */}
      {mounted && createPortal(
        <div 
          className={`fixed inset-0 z-[9999] lg:hidden transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className={`absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="font-sans font-black text-xl flex items-center gap-1.5 text-primary tracking-tighter">
                DS <span className="bg-primary text-white px-1.5 py-0.5 rounded rotate-3 italic">FLOW</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full h-10 w-10">
                <X className="w-5 h-5 text-slate-400" />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname.startsWith(link.href)
                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 text-sm font-bold ${
                      isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="p-6 border-t border-slate-100 bg-white">
              <Link 
                href="/api/auth/signout" 
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-600 font-bold hover:bg-red-50 transition-colors text-sm"
              >
                <LogOut className="w-5 h-5" />
                Logout Account
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
