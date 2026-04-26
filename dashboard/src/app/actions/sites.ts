"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import crypto from "crypto"
import { logAudit } from "@/lib/logger"
import { revalidatePath } from "next/cache"

export async function generateConnectionKey() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
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
        userId: session.user.id,
      },
    })

    await logAudit({
      action: "CONNECTION_KEY_GENERATED",
      userId: session.user.id,
      siteId: site.id
    });

    return { success: true, connectionKey, siteId: site.id }
  } catch (error: any) {
    return { error: "Failed to generate key" }
  }
}

export async function deleteSite(siteId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return { error: "Unauthorized" }
  }

  try {
    const siteIdToSafeDelete = siteId;

    // Manual cleanup for relations to avoid FK constraint issues if DB is out of sync with Prisma
    await prisma.$transaction([
      prisma.productCard.deleteMany({ where: { promoSection: { siteId: siteIdToSafeDelete } } }),
      prisma.promoSection.deleteMany({ where: { siteId: siteIdToSafeDelete } }),
      prisma.product.deleteMany({ where: { siteId: siteIdToSafeDelete } }),
      prisma.site.delete({ where: { id: siteIdToSafeDelete } })
    ]);

    await logAudit({
      action: "SITE_DELETED",
      userId: session.user.id,
      siteId: siteIdToSafeDelete
    });

    revalidatePath("/dashboard/sites");

    return { success: true }
  } catch (error: any) {
    console.error("[deleteSite Action Error]:", error)
    return { error: `Failed to delete site: ${error.message || "Unknown error"}` }
  }
}
