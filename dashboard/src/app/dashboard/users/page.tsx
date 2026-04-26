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
import { ShieldCheck, UserCog, Users } from "lucide-react"
import UserForm from "./UserForm"
import UserActions from "./UserActions"

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard/sites")
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto">
       {/* Header Section */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-4xl font-sans font-extrabold tracking-tight text-slate-900">
            User <span className="text-primary italic">Management</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Manage your internal team, roles, and access permissions.
          </p>
        </div>
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-2 px-4 py-2 border border-slate-200 shadow-sm">
           <ShieldCheck className="w-5 h-5 text-green-600" />
           <span className="text-sm font-bold text-slate-700">Admin Mode Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <Card className="rounded-[2rem] border-slate-200 shadow-xl overflow-hidden sticky top-8">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-primary" />
                Add New Member
              </CardTitle>
              <CardDescription>
                Invite a new staff member to manage your sites.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <UserForm />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Table */}
        <div className="lg:col-span-2">
          <Card className="rounded-[2.5rem] border-slate-200/50 shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
              <CardTitle className="text-xl font-sans font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-slate-400" />
                Team Directory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent bg-slate-50/30">
                    <TableHead className="px-8 font-bold text-slate-500 text-xs uppercase tracking-widest">User</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-widest">Role</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-widest">Status</TableHead>
                    <TableHead className="px-8 text-right font-bold text-slate-500 text-xs uppercase tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                      <TableCell className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{user.email}</span>
                          <span className="text-xs text-slate-400">ID: {user.id.substring(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="rounded-full px-3">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`} />
                            <span className={`text-sm font-medium ${user.isActive ? "text-green-700" : "text-red-700"}`}>
                              {user.isActive ? "Active" : "Disabled"}
                            </span>
                         </div>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                        <UserActions userId={user.id} isActive={user.isActive} currentUserId={session.user.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
