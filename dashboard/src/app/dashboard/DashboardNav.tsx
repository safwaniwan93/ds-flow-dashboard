"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Package, Shield, Globe } from "lucide-react"

export default function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard/sites", label: "Sites", icon: Globe },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/builder", label: "Promo Builder", icon: LayoutGrid },
  ]

  if (role === "ADMIN") {
    links.push({ href: "/dashboard/users", label: "Users", icon: Shield })
  }

  return (
    <nav className="hidden md:flex gap-1 ml-8 text-sm font-semibold">
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
  )
}
