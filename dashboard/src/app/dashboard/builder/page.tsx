import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import BuilderClient from "./BuilderClient"
import { getActiveUser } from "@/lib/authorization"

export default async function BuilderPage() {
  const user = await getActiveUser()
  
  if (!user) {
    redirect("/api/auth/signin")
  }

  // Fetch sites connected by this user
  const sites = await prisma.site.findMany({
    where: user.role === "ADMIN"
      ? { status: "CONNECTED" }
      : { userId: user.id, status: "CONNECTED" },
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
