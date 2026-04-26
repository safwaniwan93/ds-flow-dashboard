"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { generateConnectionKey } from "@/app/actions/sites"
import { Check, Copy, Key, Loader2, RefreshCw } from "lucide-react"

export default function ConnectionManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    const res = await generateConnectionKey()
    if (res.success && res.connectionKey) {
      setKey(res.connectionKey)
      router.refresh()
    }
    setLoading(false)
  }

  function handleCopy() {
    if (key) {
      navigator.clipboard.writeText(key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) setKey(null)
    }}>
      <DialogTrigger 
        render={
          <Button className="shadow-lg rounded-xl px-6 bg-gradient-to-r from-primary to-primary/80 hover:shadow-primary/20 transition-all duration-300 font-semibold gap-2">
            <Key className="w-4 h-4" />
            Generate Connection Key
          </Button>
        }
      />
      <DialogContent className="sm:max-width-[425px] rounded-3xl border-slate-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-sans">New Connection</DialogTitle>
          <DialogDescription className="text-slate-500">
            Create a secure bridge between your WordPress site and this dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {!key ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-slate-600">
                A unique, one-time use key will be generated. It will expire in 2 hours for maximum security.
              </p>
              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full rounded-xl py-6 text-lg font-bold"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Generate Key Now"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Connection Key</label>
                <div className="flex gap-2">
                  <Input 
                    value={key} 
                    readOnly 
                    className="bg-white border-slate-200 rounded-xl font-mono text-sm"
                  />
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={handleCopy}
                    className="rounded-xl border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-800 leading-relaxed">
                <strong>IMPORTANT:</strong> Copy this key now. It is hashed for security and will never be shown again in plain text.
              </div>
              <Button variant="secondary" onClick={() => setOpen(false)} className="w-full rounded-xl py-6">
                I've copied the key
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
