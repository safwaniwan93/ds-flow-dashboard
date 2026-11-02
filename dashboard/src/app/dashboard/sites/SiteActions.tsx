"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { deleteSite, transferSiteOwnership } from "@/app/actions/sites"
import { ArrowRightLeft, ExternalLink, MoreVertical, Settings, Trash2 } from "lucide-react"
import Link from "next/link"

type TransferUser = {
  id: string
  email: string
}

type SiteActionsProps = {
  siteId: string
  domain: string | null
  currentOwnerId: string | null
  availableUsers?: TransferUser[]
}

export default function SiteActions({ siteId, domain, currentOwnerId, availableUsers = [] }: SiteActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [targetUserId, setTargetUserId] = useState("")

  const transferTargets = availableUsers.filter((user) => user.id !== currentOwnerId)

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
    } catch {
      alert("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  async function handleTransfer() {
    if (!targetUserId) return

    try {
      setLoading(true)
      const res = await transferSiteOwnership(siteId, targetUserId)
      if (res.success) {
        setShowTransfer(false)
        setTargetUserId("")
        router.refresh()
      } else {
        alert(res.error || "Failed to transfer site ownership")
      }
    } catch {
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
            {transferTargets.length > 0 && (
              <DropdownMenuItem
                onClick={() => setShowTransfer(true)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Transfer Ownership
              </DropdownMenuItem>
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

      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent className="rounded-xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Transfer Site Ownership</DialogTitle>
            <DialogDescription className="text-slate-600 font-medium leading-relaxed">
              The new owner will receive access to this site, its products, and promo configurations. The WordPress connection will remain active.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label htmlFor={`owner-${siteId}`} className="text-sm font-semibold text-slate-700">
              New owner
            </label>
            <select
              id={`owner-${siteId}`}
              value={targetUserId}
              onChange={(event) => setTargetUserId(event.target.value)}
              disabled={loading}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select an active user</option>
              {transferTargets.map((user) => (
                <option key={user.id} value={user.id}>{user.email}</option>
              ))}
            </select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowTransfer(false)}
              disabled={loading}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={loading || !targetUserId}
              className="rounded-lg px-6 font-bold"
            >
              {loading ? "Transferring..." : "Transfer Ownership"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
