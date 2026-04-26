"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { deleteSite } from "@/app/actions/sites"
import { ExternalLink, MoreVertical, Settings, Trash2 } from "lucide-react"
import Link from "next/link"

export default function SiteActions({ siteId, domain }: { siteId: string; domain: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  async function handleDelete() {
    try {
      setLoading(true)
      const res = await deleteSite(siteId)
      if (res.success) {
        setShowDelete(false)
        router.refresh()
      } else {
        alert(res.error || "Failed to disconnect site")
      }
    } catch (err) {
      alert("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <Link href={`/dashboard/builder?siteId=${siteId}`}>
          <Button variant="outline" size="sm" className="rounded-lg h-8 gap-2 border-slate-200">
            <Settings className="w-3.5 h-3.5" />
            Manage
          </Button>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 shadow-xl">
            {domain && (
              <DropdownMenuItem render={
                <a href={domain} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                  <ExternalLink className="w-4 h-4" />
                  Visit Site
                </a>
              } />
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setShowDelete(true)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Disconnect Site
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="rounded-3xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Disconnect Site?</DialogTitle>
            <DialogDescription className="text-slate-600 font-medium leading-relaxed">
              This will instantly invalidate the site token and stop all synchronization. All product data and promo configs for this site will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowDelete(false)} disabled={loading} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={loading} 
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 shadow-lg shadow-red-200/50 transition-all active:scale-95"
            >
              {loading ? "Disconnecting..." : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
