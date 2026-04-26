"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcrypt"
import { logAudit } from "@/lib/logger"

export async function createUser(data: { email: string; password: string; role: "STAFF" | "ADMIN" }) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized. Only Admins can create users." }
  }

  if (data.password.length < 8) {
    return { error: "Password must be at least 8 characters long." }
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return { error: "User with this email already exists." }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        isActive: true,
      }
    })

    await logAudit({
      action: "USER_CREATED",
      userId: session.user.id,
      details: { createdUserId: user.id, role: user.role }
    });

    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to create user" }
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized." }
  }

  // Prevent disabling self
  if (session.user.id === userId) {
    return { error: "Cannot disable your own account." }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    })

    await logAudit({
      action: "USER_STATUS_CHANGED",
      userId: session.user.id,
      details: { targetUserId: userId, isActive }
    });

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to toggle user status." }
  }
}
