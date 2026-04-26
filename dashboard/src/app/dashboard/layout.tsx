import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-6 border-b border-slate-200 bg-white px-8 shadow-sm">
        <Link href="/dashboard" className="font-sans font-bold text-2xl flex items-center gap-2 text-primary tracking-tight">
          DS Flow
        </Link>
        <nav className="hidden md:flex gap-8 ml-8 text-sm font-semibold">
          <Link href="/dashboard/sites" className="text-slate-500 hover:text-primary transition-colors">
            Sites
          </Link>
          <Link href="/dashboard/products" className="text-slate-500 hover:text-primary transition-colors">
            Products
          </Link>
          <Link href="/dashboard/builder" className="text-slate-500 hover:text-primary transition-colors">
            Promo Builder
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Staff Member</span>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            S
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
