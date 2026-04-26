"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import crypto from "crypto"
import { logAudit } from "@/lib/logger"

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
    // Check ownership if STAFF
    if (session.user.role === "STAFF") {
      const site = await prisma.site.findFirst({
        where: { id: siteId, userId: session.user.id }
      })
      if (!site) return { error: "Unauthorized access to this site" }
    }

    await prisma.site.delete({
      where: { id: siteId }
    })

    await logAudit({
      action: "SITE_DELETED",
      userId: session.user.id,
      siteId: siteId
    });

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to delete site" }
  }
}
