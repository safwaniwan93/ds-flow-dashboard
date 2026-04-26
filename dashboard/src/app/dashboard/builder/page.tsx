import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import BuilderClient from "./BuilderClient"

export default async function BuilderPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  // Fetch sites connected by this user
  const sites = await prisma.site.findMany({
    where: {
      userId: session.user.id,
      status: "CONNECTED",
    },
    include: {
      products: true,
      promoSections: {
        include: {
          cards: {
            orderBy: { sortOrder: "asc" }
          }
        },
        orderBy: { updatedAt: "desc" }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return (
    <BuilderClient sites={sites} />
  )
}
