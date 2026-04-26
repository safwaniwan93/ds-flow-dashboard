import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
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

export default async function SitesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  // Fetch sites from DB respecting role
  const sites = await prisma.site.findMany({
    where: session.user.role === "ADMIN" ? undefined : { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between pb-2 border-b">
        <div>
          <h1 className="text-4xl font-sans font-bold tracking-tight text-slate-900">Site Management</h1>
          <p className="text-muted-foreground mt-1">
            Connect and manage your WordPress websites.
          </p>
        </div>
        <Button className="shadow-md rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Generate Connection Key</Button>
      </div>

      <Card className="shadow-sm border-slate-200/60 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
          <CardTitle className="text-lg font-sans">Connected Sites</CardTitle>
          <CardDescription>
            A list of all WordPress sites currently connected to this dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600">Domain</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Last Sync</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No sites connected. Generate a key to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">
                      {site.domain || "Unknown (Pending)"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={site.status === "CONNECTED" ? "default" : "secondary"}>
                        {site.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {site.lastSync ? site.lastSync.toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        View Config
                      </Button>
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
