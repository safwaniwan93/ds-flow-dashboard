"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toggleUserStatus } from "@/app/actions/users"
import { Loader2, Power, PowerOff } from "lucide-react"

export default function UserActions({ userId, isActive, currentUserId }: { userId: string; isActive: boolean; currentUserId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const res = await toggleUserStatus(userId, !isActive)
    if (res.success) {
      router.refresh()
    }
    setLoading(false)
  }

  if (userId === currentUserId) return <span className="text-xs text-slate-400 italic">Current User</span>

  return (
    <Button 
      variant={isActive ? "outline" : "default"} 
      size="sm" 
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg h-8 gap-2 ${isActive ? "border-red-100 text-red-600 hover:bg-red-50" : "bg-green-600 hover:bg-green-700"}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isActive ? (
        <>
          <PowerOff className="w-3.5 h-3.5" />
          Disable
        </>
      ) : (
        <>
          <Power className="w-3.5 h-3.5" />
          Enable
        </>
      )}
    </Button>
  )
}
