"use server"

import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/logger"
import { getAuthorizedSite } from "@/lib/authorization"
import { boundedString, optionalPublicHttpsUrl } from "@/lib/validation"

type PromoCardInput = {
  productId?: unknown
  cardTitle?: unknown
  topLabel?: unknown
  promoChip?: unknown
  miniOfferText?: unknown
  posterOverride?: unknown
  priceOverride?: unknown
  regularPriceOverride?: unknown
  featureList?: unknown
  buttonText?: unknown
  visible?: unknown
}

type PromoConfigInput = {
  slotKey?: unknown
  labelText?: unknown
  titleLine1?: unknown
  titleLine2?: unknown
  description?: unknown
  theme?: unknown
  cards?: unknown
}

export async function savePromoConfig(siteId: string, config: PromoConfigInput, publish: boolean) {
  const { user, site } = await getAuthorizedSite(siteId)

  if (!user) {
    return { error: "Unauthorized" }
  }

  if (!site) {
    return { error: "Site not found or access denied" }
  }

  const slotKey = typeof config.slotKey === "string" ? config.slotKey.trim().toLowerCase() : ""
  const cards = Array.isArray(config.cards) ? config.cards as PromoCardInput[] : []

  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(slotKey)) {
    return { error: "Slot key must contain only lowercase letters, numbers, and hyphens." }
  }

  if (cards.length > 50) {
    return { error: "A promo section cannot contain more than 50 cards." }
  }

  try {
    const status = publish ? "PUBLISHED" : "DRAFT"

    const productIds = [...new Set(cards
      .map((card) => typeof card.productId === "string" ? card.productId : "")
      .filter(Boolean))]

    const matchingProducts = await prisma.product.count({
      where: {
        id: { in: productIds },
        siteId: site.id,
      },
    })

    if (matchingProducts !== productIds.length) {
      return { error: "One or more selected products do not belong to this site." }
    }

    await prisma.$transaction(async (tx) => {
      const section = await tx.promoSection.upsert({
        where: {
          siteId_slotKey: {
            siteId: site.id,
            slotKey,
          }
        },
        update: {
          labelText: boundedString(config.labelText, 120),
          titleLine1: boundedString(config.titleLine1, 160),
          titleLine2: boundedString(config.titleLine2, 160),
          description: boundedString(config.description, 1000),
          themeVariant: boundedString(config.theme, 32, "gold") || "gold",
          status,
        },
        create: {
          siteId: site.id,
          slotKey,
          labelText: boundedString(config.labelText, 120),
          titleLine1: boundedString(config.titleLine1, 160),
          titleLine2: boundedString(config.titleLine2, 160),
          description: boundedString(config.description, 1000),
          themeVariant: boundedString(config.theme, 32, "gold") || "gold",
          status,
        }
      })

      await tx.productCard.deleteMany({
        where: { promoSectionId: section.id }
      })

      if (cards.length > 0) {
        await tx.productCard.createMany({
          data: cards.flatMap((card, sortOrder) => {
            const productId = typeof card.productId === "string" ? card.productId : ""
            if (!productId) return []

            const posterOverride = optionalPublicHttpsUrl(card.posterOverride)
            return [{
              promoSectionId: section.id,
              productId,
              cardTitle: boundedString(card.cardTitle, 160),
              topLabel: boundedString(card.topLabel, 80),
              promoChip: boundedString(card.promoChip, 80),
              miniOfferText: boundedString(card.miniOfferText, 160),
              posterOverride,
              priceOverride: boundedString(card.priceOverride, 32),
              regularPriceOverride: boundedString(card.regularPriceOverride, 32),
              featureList: boundedString(card.featureList, 2000, "") || "",
              buttonText: boundedString(card.buttonText, 80, "Beli Sekarang"),
              visible: typeof card.visible === "boolean" ? card.visible : true,
              sortOrder,
            }]
          }),
        })
      }
    })

    await logAudit({
      action: publish ? "PROMO_PUBLISHED" : "PROMO_DRAFT_SAVED",
      userId: user.id,
      siteId: site.id,
      details: { slotKey, cardsCount: cards.length }
    });

    return { success: true, message: publish ? "Config published successfully!" : "Draft saved successfully!" }
  } catch (error) {
    console.error("Error saving config:", error)
    return { error: "Internal Server Error" }
  }
}

export async function deletePromoConfig(siteId: string, sectionId: string) {
  const { user, site } = await getAuthorizedSite(siteId)

  if (!user) {
    return { error: "Unauthorized" }
  }

  if (!site) {
    return { error: "Site not found or access denied" }
  }

  try {
    // Delete the section (Cascade will delete cards)
    await prisma.promoSection.delete({
      where: { id: sectionId, siteId: site.id }
    })

    await logAudit({
      action: "PROMO_DELETED",
      userId: user.id,
      siteId: site.id,
      details: { sectionId }
    });

    return { success: true, message: "Promo section deleted successfully" }
  } catch (error) {
    console.error("Error deleting config:", error)
    return { error: "Internal Server Error" }
  }
}
