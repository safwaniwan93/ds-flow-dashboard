"use client"
 
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Package, Shield, Globe, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

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
      <div className="lg:hidden ml-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Off-canvas Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Off-canvas Sidebar */}
      <div className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-white z-[101] lg:hidden transition-transform duration-300 ease-out transform ${isOpen ? "translate-x-0" : "-translate-x-full"} shadow-2xl flex flex-col`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="font-sans font-black text-xl flex items-center gap-1.5 text-primary tracking-tighter">
            DS <span className="bg-primary text-white px-1.5 py-0.5 rounded rotate-3 italic">FLOW</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname.startsWith(link.href)
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 text-base font-bold ${
                  isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <Link 
            href="/api/auth/signout" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-600 font-bold hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout Account
          </Link>
        </div>
      </div>
    </>
  )
}
