import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import DashboardNav from "./DashboardNav"
import { LogOut } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 font-sans">
      <header className="sticky top-0 z-30 flex h-20 items-center gap-4 md:gap-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 md:px-8 shadow-sm">
        <Link href="/dashboard/sites" className="font-sans font-black text-xl md:text-2xl flex items-center gap-2 text-primary tracking-tighter shrink-0">
          DS <span className="bg-primary text-white px-2 py-0.5 rounded-lg rotate-3 shadow-lg shadow-primary/20 italic">FLOW</span>
        </Link>
        
        <DashboardNav role={session?.user?.role || "STAFF"} />
 
        <div className="ml-auto flex items-center gap-3 md:gap-6">
          <div className="flex flex-col items-end hidden sm:flex">
             <span className="text-sm font-bold text-slate-900">{session?.user?.email?.split('@')[0]}</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">{session?.user?.role}</span>
          </div>
          
          <div className="group relative">
            <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-black text-base md:text-lg shadow-lg shadow-primary/20 border-2 border-white ring-1 ring-slate-100 transition-transform group-hover:scale-105 duration-200">
              {session?.user?.email?.[0].toUpperCase()}
            </div>
            <div className="absolute right-0 top-full pt-2 hidden group-hover:block w-48">
               <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                  <Link href="/api/auth/signout" className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                     <LogOut className="w-4 h-4" />
                     Logout Account
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-10 max-w-[1500px] mx-auto w-full animate-in fade-in duration-700">
        {children}
      </main>
    </div>
  )
}
