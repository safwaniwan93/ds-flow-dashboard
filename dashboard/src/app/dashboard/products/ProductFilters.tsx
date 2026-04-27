"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ProductFiltersProps {
  sites: { id: string; domain: string | null }[]
  currentSiteId: string
  currentPage: number
  totalPages: number
  totalCount: number
}

export default function ProductFilters({ 
  sites, 
  currentSiteId, 
  currentPage, 
  totalPages,
  totalCount
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = (newSiteId: string | null, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newSiteId === null) {
      params.delete("siteId")
    } else if (newSiteId) {
      params.set("siteId", newSiteId)
    }

    if (newPage > 1) {
      params.set("page", newPage.toString())
    } else {
      params.delete("page")
    }

    router.push(`/dashboard/products?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Select 
          value={currentSiteId || "all"} 
          onValueChange={(val) => updateFilters(val === "all" ? null : val, 1)}
        >
          <SelectTrigger className="w-full md:w-[260px] bg-white shadow-sm border-slate-200 rounded-xl focus:ring-primary/20">
            <SelectValue placeholder="Filter by Site" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200">
            <SelectItem value="all">All Sites</SelectItem>
            {sites.map(site => (
              <SelectItem key={site.id} value={site.id}>{site.domain || "Unknown Domain"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {currentSiteId && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => updateFilters(null, 1)}
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-2"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex items-center gap-6 bg-slate-50/50 p-1.5 px-3 rounded-2xl border border-slate-100">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Page {currentPage} of {Math.max(1, totalPages)}
        </div>
        
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage <= 1}
            onClick={() => updateFilters(currentSiteId, currentPage - 1)}
            className="h-8 w-8 rounded-lg border-slate-200 bg-white shadow-sm disabled:opacity-40 transition-all hover:bg-white hover:text-primary hover:border-primary/30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() => updateFilters(currentSiteId, currentPage + 1)}
            className="h-8 w-8 rounded-lg border-slate-200 bg-white shadow-sm disabled:opacity-40 transition-all hover:bg-white hover:text-primary hover:border-primary/30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
