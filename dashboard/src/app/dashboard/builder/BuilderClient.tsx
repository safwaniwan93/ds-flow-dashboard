"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Plus, Trash2, Edit } from "lucide-react"

import { savePromoConfig, deletePromoConfig } from "@/app/actions/builder"

// Helper to sanitize slotKey
const sanitizeSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

export default function BuilderClient({ sites }: { sites: any[] }) {
  const [viewMode, setViewMode] = useState<"LIST" | "EDIT">("LIST")
  
  const [activeSiteId, setActiveSiteId] = useState(sites.length === 1 ? sites[0].id : (sites[0]?.id || ""))
  const [status, setStatus] = useState("DRAFT")
  const [isSaving, setIsSaving] = useState(false)
  
  // Slot state
  const [activeSlot, setActiveSlot] = useState("")

  // Section State
  const [section, setSection] = useState({
    id: "",
    labelText: "+ PROMOSI SEPANJANG TAHUN +",
    titleLine1: "Pilih Pakej Anda",
    titleLine2: "PAKEJ PROMOSI TERKINI",
    description: "Pakej terbaik untuk kesihatan sendi & saraf anda. Tersedia sepanjang tahun.",
    theme: "#154200",
  })

  // Cards State
  const [cards, setCards] = useState<any[]>([])

  // Accordion State
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

  const activeSite = sites.find(s => s.id === activeSiteId)
  const availableProducts = activeSite?.products || []
  const existingPromos = activeSite?.promoSections || []

  const handleCreateNew = () => {
    setActiveSlot("")
    setSection({
      id: "",
      labelText: "+ PROMOSI SEPANJANG TAHUN +",
      titleLine1: "Pilih Pakej Anda",
      titleLine2: "PAKEJ PROMOSI TERKINI",
      description: "Pakej terbaik untuk kesihatan sendi & saraf anda. Tersedia sepanjang tahun.",
      theme: "#154200",
    })
    setCards([
      {
        id: `card-${Date.now()}`,
        productId: "",
        cardTitle: "NEW ITEM",
        topLabel: "PROMO",
        promoChip: "",
        miniOfferText: "",
        featureList: "✓ Feature 1\n✓ Feature 2",
        buttonText: "Beli Sekarang 🛒",
        visible: true,
        posterOverride: "",
        priceOverride: "",
        regularPriceOverride: "",
      }
    ])
    setStatus("DRAFT")
    setViewMode("EDIT")
  }

  const handleEdit = (promo: any) => {
    setActiveSlot(promo.slotKey)
    setSection({
      id: promo.id,
      labelText: promo.labelText || "",
      titleLine1: promo.titleLine1 || "",
      titleLine2: promo.titleLine2 || "",
      description: promo.description || "",
      theme: promo.themeVariant || "green",
    })
    
    if (promo.cards && promo.cards.length > 0) {
      setCards(promo.cards.map((c: any) => ({
        ...c,
        id: c.id || `card-${Math.random()}`
      })))
    } else {
      setCards([])
    }
    
    setStatus(promo.status)
    setViewMode("EDIT")
  }

  const handleDelete = async (promoId: string) => {
    if (confirm("Are you sure you want to delete this Promo Section? This cannot be undone.")) {
      setIsSaving(true)
      const res = await deletePromoConfig(activeSiteId, promoId)
      if (res.success) {
        alert("Promo deleted. Please refresh the page to see changes.")
        window.location.reload()
      } else {
        alert("Error: " + res.error)
      }
      setIsSaving(false)
    }
  }

  const handleSave = async (publish: boolean) => {
    if (!activeSiteId) {
      alert("Please select a site first.")
      return
    }

    if (!activeSlot) {
      alert("Please enter a Slot Key (e.g. raya-sale)")
      return
    }

    const unlinkedCard = cards.find(c => c.visible && !c.productId)
    if (unlinkedCard) {
      alert("Please select a 'Linked Product' for all visible cards before saving.")
      return
    }

    setIsSaving(true)
    const payload = {
      slotKey: activeSlot,
      ...section,
      cards
    }
    
    const res = await savePromoConfig(activeSiteId, payload, publish)
    if (res.success) {
      setStatus(publish ? "PUBLISHED" : "DRAFT")
      alert("Saved successfully! Please refresh the page to see changes in the list view.")
      window.location.reload()
    } else {
      alert("Error: " + res.error)
    }
    setIsSaving(false)
  }

  // ============== LIST VIEW ==============
  if (viewMode === "LIST") {
    return (
      <div className="flex flex-col gap-8 pb-12 w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between pb-2 border-b">
          <div>
            <h1 className="text-4xl font-sans font-bold tracking-tight text-slate-900">Promo Builder</h1>
            <p className="text-muted-foreground mt-1">Manage your sales page promo sections.</p>
          </div>
          <Button 
            className="shadow-md rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            onClick={handleCreateNew}
          >
            <Plus className="w-4 h-4 mr-2" /> Create New Promo
          </Button>
        </div>

        <div className="space-y-2 max-w-sm">
          <label className="text-sm font-semibold text-slate-700">Filter by Site</label>
          <select 
            value={activeSiteId} 
            onChange={(e) => setActiveSiteId(e.target.value)}
            className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="" disabled>Select a site...</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>{site.domain || "Unknown Domain"}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {existingPromos.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p>No promos found for this site.</p>
              <Button variant="link" onClick={handleCreateNew}>Create your first promo</Button>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Slot Key / Shortcode</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {existingPromos.map((promo: any) => (
                  <tr key={promo.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        [ds_flow slot="{promo.slotKey}"]
                      </code>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{promo.titleLine1 || "Untitled"}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={promo.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600'}>
                        {promo.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(promo.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(promo)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(promo.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }

  // ============== EDIT VIEW ==============
  return (
    <div className="flex flex-col md:flex-row gap-10 items-start relative">
      
      {/* LEFT PANEL: CONFIGURATION FORM */}
      <div className="w-full md:w-1/2 flex flex-col gap-8 pb-12">
        <div className="flex items-center justify-between pb-2 border-b">
          <div>
            <Button variant="link" className="p-0 h-auto text-slate-400 hover:text-slate-700 mb-2" onClick={() => setViewMode("LIST")}>
              &larr; Back to List
            </Button>
            <h1 className="text-3xl font-sans font-bold tracking-tight text-slate-900">
              {section.id ? "Edit Promo" : "Create Promo"}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="shadow-sm rounded-xl px-6"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              Save Draft
            </Button>
            <Button 
              className="shadow-md rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              Publish
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-slate-200/60 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-sans">1. Connection Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2 opacity-70">
              <label className="text-sm font-semibold text-slate-700">Site</label>
              <Input value={activeSite?.domain || ""} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Slot Key (Identifier)</label>
              <Input 
                value={activeSlot} 
                onChange={(e) => setActiveSlot(sanitizeSlug(e.target.value))}
                placeholder="e.g. raya-sale-2026"
                disabled={!!section.id} // Cannot edit slot key once created
                className="font-mono text-sm"
              />
              {activeSlot && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">WordPress Shortcode</p>
                    <code className="text-sm font-mono text-slate-800 font-semibold select-all">[ds_flow slot="{activeSlot}"]</code>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 text-xs bg-white text-primary hover:text-primary hover:bg-slate-50"
                    onClick={() => {
                      navigator.clipboard.writeText(`[ds_flow slot="${activeSlot}"]`);
                      alert("Shortcode copied to clipboard!");
                    }}
                  >
                    Copy
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-sans">2. Section Settings</CardTitle>
            <Badge variant="outline" className="bg-white text-slate-500 rounded-full px-3">{status}</Badge>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Label Text</label>
              <Input 
                value={section.labelText} 
                onChange={(e) => setSection({...section, labelText: e.target.value})} 
                className="rounded-xl border-slate-200 focus-visible:ring-primary/20 py-6"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Title Line 1</label>
                <Input 
                  value={section.titleLine1} 
                  onChange={(e) => setSection({...section, titleLine1: e.target.value})} 
                  className="rounded-xl border-slate-200 focus-visible:ring-primary/20 py-6"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Title Line 2</label>
                <Input 
                  value={section.titleLine2} 
                  onChange={(e) => setSection({...section, titleLine2: e.target.value})} 
                  className="rounded-xl border-slate-200 focus-visible:ring-primary/20 py-6"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <Input 
                value={section.description} 
                onChange={(e) => setSection({...section, description: e.target.value})} 
                className="rounded-xl border-slate-200 focus-visible:ring-primary/20 py-6"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100 flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-sans">3. Product Cards</CardTitle>
            <Button 
              size="sm" 
              variant="secondary" 
              className="rounded-lg shadow-sm"
              onClick={() => {
                const newId = `card-${Date.now()}`
                setCards([
                  ...cards, 
                  {
                    id: newId,
                    productId: "",
                    cardTitle: "NEW ITEM",
                    topLabel: "PROMO",
                    promoChip: "",
                    miniOfferText: "",
                    featureList: "✓ Feature 1\n✓ Feature 2",
                    buttonText: "Beli Sekarang 🛒",
                    visible: true,
                    posterOverride: "",
                    priceOverride: "",
                    regularPriceOverride: "",
                  }
                ])
                setExpandedCardId(newId) // Auto-expand new card
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Card
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 bg-slate-50/30">
            {cards.map((card, idx) => {
              const isExpanded = expandedCardId === card.id;
              
              return (
                <div key={card.id} className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-200">
                  
                  {/* Accordion Header */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <h4 className={`font-bold text-sm ${!card.visible ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {card.cardTitle || "Untitled Card"}
                      </h4>
                      {!card.visible && <Badge variant="secondary" className="text-[10px]">Hidden</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div className="p-6 border-t border-slate-100 space-y-5 bg-white relative">
                      <div className="absolute top-6 right-6 flex gap-2 z-10">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newCards = [...cards]
                            newCards[idx].visible = !newCards[idx].visible
                            setCards(newCards)
                          }}
                        >
                          {card.visible ? "Hide" : "Show"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newCards = cards.filter((_, i) => i !== idx)
                            setCards(newCards)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <label className="text-xs font-semibold text-slate-600">Select Linked Product</label>
                        <select 
                          value={card.productId} 
                          onChange={(e) => {
                            const newCards = [...cards]
                            newCards[idx].productId = e.target.value
                            setCards(newCards)
                          }}
                          className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Select a product...</option>
                          {availableProducts.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-600">Card Title (Override)</label>
                          <Input value={card.cardTitle} className="rounded-xl h-10" onChange={(e) => {
                            const newCards = [...cards]
                            newCards[idx].cardTitle = e.target.value
                            setCards(newCards)
                          }} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-600">Top Label</label>
                          <Input value={card.topLabel} className="rounded-xl h-10" onChange={(e) => {
                            const newCards = [...cards]
                            newCards[idx].topLabel = e.target.value
                            setCards(newCards)
                          }} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-600">Mini Offer Pill (Below Title)</label>
                          <Input value={card.miniOfferText} className="rounded-xl h-10" onChange={(e) => {
                            const newCards = [...cards]
                            newCards[idx].miniOfferText = e.target.value
                            setCards(newCards)
                          }} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-600">Top Promo Chip (e.g. ★ POPULAR)</label>
                          <Input value={card.promoChip} className="rounded-xl h-10" onChange={(e) => {
                            const newCards = [...cards]
                            newCards[idx].promoChip = e.target.value
                            setCards(newCards)
                          }} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-600">Active Price Override</label>
                          <Input placeholder="e.g. 129.00" value={card.priceOverride || ""} className="rounded-xl h-10" onChange={(e) => {
                            const newCards = [...cards]
                            newCards[idx].priceOverride = e.target.value
                            setCards(newCards)
                          }} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-600">Regular Price (for Jimat)</label>
                          <Input placeholder="e.g. 154.00" value={card.regularPriceOverride || ""} className="rounded-xl h-10" onChange={(e) => {
                            const newCards = [...cards]
                            newCards[idx].regularPriceOverride = e.target.value
                            setCards(newCards)
                          }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600">Button Text</label>
                        <Input value={card.buttonText} className="rounded-xl h-10" onChange={(e) => {
                          const newCards = [...cards]
                          newCards[idx].buttonText = e.target.value
                          setCards(newCards)
                        }} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600">Features (one per line, use [FREE] for green pill)</label>
                        <textarea 
                          value={card.featureList} 
                          className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                          onChange={(e) => {
                            const newCards = [...cards]
                            newCards[idx].featureList = e.target.value
                            setCards(newCards)
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600">Poster Override URL</label>
                        <Input 
                          placeholder="Leave empty to use WooCommerce image" 
                          value={card.posterOverride || ""} 
                          className="rounded-xl h-10"
                          onChange={(e) => {
                            const newCards = [...cards]
                            newCards[idx].posterOverride = e.target.value
                            setCards(newCards)
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT PANEL: LIVE PREVIEW */}
      <div className="w-full md:w-1/2 rounded-3xl p-6 md:p-10 overflow-y-auto sticky top-8 h-[calc(100vh-6rem)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Preview</h3>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
          </div>
        </div>
        
        <div className="p-8 md:p-12 rounded-[2.5rem] border border-slate-100 bg-[#f8fafc] shadow-sm font-sans transition-all duration-500">
          
          <div className="text-center mb-16">
            {section.labelText && (
              <span className="inline-block px-5 py-2 bg-[#f0fdf4] border border-[#dcfce7] text-[#154200] rounded-full text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
                {section.labelText}
              </span>
            )}
            <h2 className="text-4xl md:text-5xl font-serif font-black text-[#0f172a] mb-4 tracking-tight leading-[1.1]">{section.titleLine1}</h2>
            <h3 className="text-2xl md:text-3xl font-black text-[#154200] mb-8 uppercase tracking-widest">{section.titleLine2}</h3>
            <p className="text-slate-600 max-w-xl mx-auto leading-relaxed text-lg font-normal">{section.description}</p>
          </div>
 
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {cards.map(card => {
              const product = availableProducts.find((p: any) => p.id === card.productId)
              
              const activePriceRaw = card.priceOverride || product?.activePrice || product?.price || "0"
              const regularPriceRaw = card.regularPriceOverride || product?.regularPrice || product?.price || "0"
              
              const activePrice = parseFloat(activePriceRaw)
              const regularPrice = parseFloat(regularPriceRaw)
              
              const showStrikethrough = regularPrice > activePrice
              const savingsAmount = showStrikethrough ? (regularPrice - activePrice) : 0
 
              return (
                <div key={card.id} className={`bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] ${!card.visible && 'opacity-40 grayscale'}`}>
                  
                  {/* Top Premium Block */}
                  <div className="relative bg-[#154200] bg-gradient-to-br from-[#1a5200] to-[#154200] text-white p-10 text-center flex flex-col items-center justify-center min-h-[160px]">
                    {card.promoChip && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#451a03] px-5 py-1.5 text-[10px] font-black rounded-b-xl shadow-lg whitespace-nowrap uppercase tracking-wider">
                        {card.promoChip}
                      </div>
                    )}
                    {card.topLabel && (
                      <div className="text-[10px] font-bold text-[#86efac] tracking-[0.2em] uppercase mb-3 mt-4 opacity-90">
                        {card.topLabel}
                      </div>
                    )}
                    <h4 className="text-2xl font-black font-serif mb-4 leading-tight tracking-tight">
                      {card.cardTitle || product?.name || "Product Name"}
                    </h4>
                    {card.miniOfferText && (
                      <div className="bg-white/10 border border-white/20 backdrop-blur-sm text-white rounded-full px-5 py-1.5 text-sm font-semibold whitespace-nowrap">
                        {card.miniOfferText}
                      </div>
                    )}
                  </div>
 
                  {/* Image Block - FIXED FIT */}
                  <div className="relative w-full h-72 bg-[#f8fafc] border-b border-slate-50 flex items-center justify-center p-6">
                    {(card.posterOverride || product?.image) ? (
                      <img 
                        src={card.posterOverride || product?.image} 
                        alt="Product" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-300 text-xs font-black tracking-widest">NO IMAGE SOURCE</span>
                    )}
                  </div>
 
                  {/* Content & Price Block */}
                  <div className="p-8 flex flex-col flex-grow w-full z-10 relative bg-white">
                    {/* Price Block */}
                    <div className="mb-8 pb-8 border-b border-slate-50 flex flex-col gap-2">
                      <div className="flex items-baseline gap-1.5 leading-none">
                        <span className="text-base font-black text-[#154200] mb-1">RM</span>
                        <span className="text-5xl font-black text-[#154200] tracking-tighter leading-[0.85]">{activePriceRaw}</span>
                        {showStrikethrough && (
                          <span className="text-base text-slate-400 line-through font-medium ml-2">RM{regularPriceRaw}</span>
                        )}
                      </div>
                      {showStrikethrough && (
                        <div className="inline-flex items-center bg-[#154200] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm w-fit">
                          Jimat RM{savingsAmount}
                        </div>
                      )}
                    </div>
 
                    {/* Features */}
                    <ul className="space-y-4 mb-8 flex-grow">
                      {(card.featureList || "").split('\n').filter(Boolean).map((feature: string, i: number) => {
                        const hasFree = feature.includes('[FREE]');
                        const cleanFeature = feature.replace('[FREE]', '').replace('✓', '').trim();
                        
                        return (
                          <li key={i} className="text-sm text-[#334155] flex items-start gap-3 font-medium">
                            <span className="text-[#154200] font-black text-base mt-0">✓</span>
                            <span className="leading-relaxed flex-1 flex flex-wrap gap-1.5 items-center">
                              {hasFree && (
                                <span className="bg-gradient-to-r from-[#154200] to-[#1a5200] text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider shadow-sm">
                                  FREE
                                </span>
                              )}
                              {cleanFeature}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
 
                    {/* CTA Button */}
                    <div className="w-full mt-auto bg-gradient-to-br from-[#154200] to-[#1a5200] text-white text-center py-5 rounded-2xl text-base font-bold tracking-wide hover:from-[#1a5200] hover:to-[#154200] transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(21,66,0,0.4)] cursor-pointer hover:shadow-[0_15px_30px_-5px_rgba(21,66,0,0.5)] flex justify-center items-center gap-2 hover:-translate-y-1 active:translate-y-0">
                      {card.buttonText || "Beli Sekarang 🛒"}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
 
        </div>
      </div>

    </div>
  )
}
