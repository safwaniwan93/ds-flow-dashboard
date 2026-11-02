import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getActiveUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  return prisma.user.findFirst({
    where: {
      id: session.user.id,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  })
}

export async function getAuthorizedSite(siteId: string) {
  const user = await getActiveUser()

  if (!user) {
    return { user: null, site: null }
  }

  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      ...(user.role === "ADMIN" ? {} : { userId: user.id }),
    },
  })

  return { user, site }
}
