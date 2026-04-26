"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function savePromoConfig(siteId: string, config: any, publish: boolean) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return { error: "Unauthorized" }
  }

  // Verify site belongs to user if they are STAFF
  if (session.user.role === "STAFF") {
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: session.user.id }
    })
    if (!site) return { error: "Unauthorized access to this site" }
  }

  try {
    const status = publish ? "PUBLISHED" : "DRAFT"

    // Process section
    const section = await prisma.promoSection.upsert({
      where: {
        siteId_slotKey: {
          siteId,
          slotKey: config.slotKey,
        }
      },
      update: {
        labelText: config.labelText,
        titleLine1: config.titleLine1,
        titleLine2: config.titleLine2,
        description: config.description,
        themeVariant: config.theme,
        status: status,
      },
      create: {
        siteId,
        slotKey: config.slotKey,
        labelText: config.labelText,
        titleLine1: config.titleLine1,
        titleLine2: config.titleLine2,
        description: config.description,
        themeVariant: config.theme,
        status: status,
      }
    })

    // Process cards
    // First, delete existing cards for this section to cleanly re-insert (MVP simple array sync)
    await prisma.productCard.deleteMany({
      where: { promoSectionId: section.id }
    })

    // Recreate cards with new ordering and data
    for (let i = 0; i < config.cards.length; i++) {
      const card = config.cards[i]
      if (!card.productId) continue; // Skip unlinked cards to prevent DB errors
      
      await prisma.productCard.create({
        data: {
          promoSectionId: section.id,
          productId: card.productId,
          cardTitle: card.cardTitle,
          topLabel: card.topLabel,
          promoChip: card.promoChip,
          miniOfferText: card.miniOfferText,
          posterOverride: card.posterOverride,
          priceOverride: card.priceOverride,
          regularPriceOverride: card.regularPriceOverride,
          featureList: card.featureList,
          buttonText: card.buttonText,
          visible: card.visible,
          sortOrder: i,
        }
      })
    }

    if (publish) {
      try {
        const site = await prisma.site.findUnique({ where: { id: siteId } });
        if (site && site.domain && site.siteToken) {
          // Normalize domain just in case
          const domain = site.domain.replace(/\/+$/, '');
          await fetch(`${domain}/wp-json/ds-flow/v1/webhook`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${site.siteToken}`
            },
            body: JSON.stringify({ action: 'clear_config_cache' })
          }).catch(e => console.error("Webhook trigger failed passively:", e));
        }
      } catch (e) {
        console.error("Failed to trigger webhook", e);
      }
    }

    return { success: true, message: publish ? "Config published successfully!" : "Draft saved successfully!" }
  } catch (error: any) {
    console.error("Error saving config:", error)
    return { error: error.message || "Internal Server Error" }
  }
}

export async function deletePromoConfig(siteId: string, sectionId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return { error: "Unauthorized" }
  }

  if (session.user.role === "STAFF") {
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: session.user.id }
    })
    if (!site) return { error: "Unauthorized access to this site" }
  }

  try {
    // Delete the section (Cascade will delete cards)
    await prisma.promoSection.delete({
      where: { id: sectionId, siteId: siteId }
    })

    // Ping webhook to clear cache
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (site && site.domain && site.siteToken) {
      const domain = site.domain.replace(/\/+$/, '');
      await fetch(`${domain}/wp-json/ds-flow/v1/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${site.siteToken}`
        },
        body: JSON.stringify({ action: 'clear_config_cache' })
      }).catch(() => {});
    }

    return { success: true, message: "Promo section deleted successfully" }
  } catch (error: any) {
    console.error("Error deleting config:", error)
    return { error: "Internal Server Error" }
  }
}
