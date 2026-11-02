"use server"

import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { logAudit } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import { getActiveUser, getAuthorizedSite } from "@/lib/authorization"

export async function generateConnectionKey() {
  const user = await getActiveUser()
  
  if (!user) {
    return { error: "Unauthorized" }
  }

  try {
    const connectionKey = crypto.randomBytes(32).toString("hex")
    const connectionKeyHash = crypto.createHash('sha256').update(connectionKey).digest('hex')

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 2)

    const site = await prisma.site.create({
      data: {
        connectionKeyHash,
        connectionKeyExpiresAt: expiresAt,
        status: "PENDING",
        userId: user.id,
      },
    })

    await logAudit({
      action: "CONNECTION_KEY_GENERATED",
      userId: user.id,
      siteId: site.id
    });

    return { success: true, connectionKey, siteId: site.id }
  } catch {
    return { error: "Failed to generate key" }
  }
}

export async function deleteSite(siteId: string) {
  const { user, site } = await getAuthorizedSite(siteId)

  if (!user) {
    return { error: "Unauthorized" }
  }

  if (!site) {
    return { error: "Site not found or access denied" }
  }

  try {
    const siteIdToSafeDelete = site.id;

    // Manual cleanup for relations to avoid FK constraint issues if DB is out of sync with Prisma
    await prisma.$transaction([
      prisma.productCard.deleteMany({ where: { promoSection: { siteId: siteIdToSafeDelete } } }),
      prisma.promoSection.deleteMany({ where: { siteId: siteIdToSafeDelete } }),
      prisma.product.deleteMany({ where: { siteId: siteIdToSafeDelete } }),
      prisma.site.delete({ where: { id: siteIdToSafeDelete } })
    ]);

    await logAudit({
      action: "SITE_DELETED",
      userId: user.id,
      siteId: siteIdToSafeDelete
    });

    revalidatePath("/dashboard/sites");

    return { success: true }
  } catch (error) {
    console.error("[deleteSite Action Error]:", error)
    return { error: "Failed to delete site" }
  }
}

export async function transferSiteOwnership(siteId: string, targetUserId: string) {
  const currentUser = await getActiveUser()

  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Unauthorized. Only admins can transfer site ownership." }
  }

  if (!siteId || !targetUserId || siteId.length > 64 || targetUserId.length > 64) {
    return { error: "Invalid site or target user." }
  }

  try {
    const [site, targetUser] = await Promise.all([
      prisma.site.findUnique({
        where: { id: siteId },
        select: { id: true, userId: true },
      }),
      prisma.user.findFirst({
        where: { id: targetUserId, isActive: true },
        select: { id: true, email: true },
      }),
    ])

    if (!site) {
      return { error: "Site not found." }
    }

    if (!targetUser) {
      return { error: "Target user was not found or is inactive." }
    }

    if (site.userId === targetUser.id) {
      return { error: "This user already owns the site." }
    }

    const previousOwnerId = site.userId

    await prisma.site.update({
      where: { id: site.id },
      data: { userId: targetUser.id },
    })

    await logAudit({
      action: "SITE_OWNERSHIP_TRANSFERRED",
      userId: currentUser.id,
      siteId: site.id,
      details: {
        previousOwnerId,
        targetUserId: targetUser.id,
        targetEmail: targetUser.email,
      },
    })

    revalidatePath("/dashboard/sites")
    revalidatePath("/dashboard/builder")
    revalidatePath("/dashboard/products")

    return { success: true, ownerEmail: targetUser.email }
  } catch (error) {
    console.error("[transferSiteOwnership Action Error]:", error)
    return { error: "Failed to transfer site ownership." }
  }
}
