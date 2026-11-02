"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { logAudit } from "@/lib/logger"
import { getActiveUser } from "@/lib/authorization"

export async function createUser(data: { email: string; password: string; role: "STAFF" | "ADMIN" }) {
  const currentUser = await getActiveUser()
  
  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Unauthorized. Only Admins can create users." }
  }

  const email = data.email.trim().toLowerCase()
  if (!email || email.length > 320 || !email.includes("@")) {
    return { error: "A valid email address is required." }
  }

  if (data.password.length < 12 || data.password.length > 128) {
    return { error: "Password must be between 12 and 128 characters long." }
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { error: "User with this email already exists." }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: data.role,
        isActive: true,
      }
    })

    await logAudit({
      action: "USER_CREATED",
      userId: currentUser.id,
      details: { createdUserId: user.id, role: user.role }
    });

    return { success: true }
  } catch (error) {
    console.error("Failed to create user:", error)
    return { error: "Failed to create user" }
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const currentUser = await getActiveUser()
  
  if (!currentUser || currentUser.role !== "ADMIN") {
    return { error: "Unauthorized." }
  }

  // Prevent disabling self
  if (currentUser.id === userId) {
    return { error: "Cannot disable your own account." }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    })

    await logAudit({
      action: "USER_STATUS_CHANGED",
      userId: currentUser.id,
      details: { targetUserId: userId, isActive }
    });

    return { success: true }
  } catch {
    return { error: "Failed to toggle user status." }
  }
}
