import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Globe, LayoutGrid, Zap } from "lucide-react"
import ConnectionManager from "./ConnectionManager"
import SiteActions from "./SiteActions"

export default async function SitesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  // Fetch sites from DB respecting role
  const sites = await prisma.site.findMany({
    where: session.user.role === "ADMIN" ? undefined : { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { products: true, promoSections: true }
      }
    }
  })

  const connectedSitesCount = sites.filter(s => s.status === "CONNECTED").length
  const totalProducts = sites.reduce((acc, s) => acc + s._count.products, 0)
  const totalPromos = sites.reduce((acc, s) => acc + s._count.promoSections, 0)

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-4xl font-sans font-extrabold tracking-tight text-slate-900">
            Sites & <span className="text-primary italic">Connections</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Manage your multisite WordPress ecosystem from one central hub.
          </p>
        </div>
        <ConnectionManager />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Sites</p>
              <h3 className="text-2xl font-bold text-slate-900">{connectedSitesCount} <span className="text-sm font-normal text-slate-500">connected</span></h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Synced Products</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalProducts} <span className="text-sm font-normal text-slate-500">items</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Promo Sections</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalPromos} <span className="text-sm font-normal text-slate-500">active</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="shadow-xl border-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-slate-50/50 px-8 py-6 border-b border-slate-100/80">
          <CardTitle className="text-xl font-sans font-bold flex items-center gap-2">
            Connected Inventory
          </CardTitle>
          <CardDescription className="text-slate-500">
            Detailed breakdown of every WordPress instance linked to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent bg-slate-50/30">
                <TableHead className="px-8 font-bold text-slate-500 text-xs uppercase tracking-widest">Domain & ID</TableHead>
                <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-widest text-center">Stats</TableHead>
                <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-widest">Last Sync</TableHead>
                <TableHead className="px-8 text-right font-bold text-slate-500 text-xs uppercase tracking-widest">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                        <Globe className="w-10 h-10 text-slate-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-bold text-slate-900">No Sites Found</p>
                        <p className="text-slate-500">Generate a connection key to link your first WordPress site.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sites.map((site) => (
                  <TableRow key={site.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-base">
                          {site.domain || "Unknown (Pending Handshake)"}
                        </span>
                        <span className="text-xs font-mono text-slate-400">ID: {site.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={site.status === "CONNECTED" ? "default" : "secondary"}
                        className={`rounded-full px-4 py-1 border-none shadow-sm ${
                          site.status === "CONNECTED" 
                          ? "bg-green-100 text-green-700 hover:bg-green-100" 
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {site.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                         <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-900">{site._count.products}</span>
                            <span className="text-[10px] uppercase">Products</span>
                         </div>
                         <div className="w-[1px] h-6 bg-slate-100" />
                         <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-900">{site._count.promoSections}</span>
                            <span className="text-[10px] uppercase">Promos</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-600">
                        {site.lastSync ? site.lastSync.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : "Never"}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <SiteActions siteId={site.id} domain={site.domain} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
