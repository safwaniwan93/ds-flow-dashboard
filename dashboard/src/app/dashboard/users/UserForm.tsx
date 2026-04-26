"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser } from "@/app/actions/users"

export default function UserForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as "STAFF" | "ADMIN"

    const res = await createUser({ email, password, role })
    
    if (res.error) {
      setError(res.error)
    } else {
      router.refresh()
      ;(e.target as HTMLFormElement).reset()
    }
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-500">{error}</div>}
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input name="email" type="email" required placeholder="staff@example.com" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <Input name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Role</label>
        <Select name="role" defaultValue="STAFF">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STAFF">STAFF</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create User"}
      </Button>
    </form>
  )
}
