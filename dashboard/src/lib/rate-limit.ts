import { prisma } from "./prisma";

export async function rateLimit(identifier: string, endpoint: string, limit: number, windowMs: number) {
  const now = new Date();
  
  const record = await prisma.rateLimit.findUnique({
    where: {
      identifier_endpoint: {
        identifier,
        endpoint,
      },
    },
  });

  if (!record) {
    await prisma.rateLimit.create({
      data: {
        identifier,
        endpoint,
        count: 1,
        resetAt: new Date(now.getTime() + windowMs),
      },
    });
    return { success: true, remaining: limit - 1 };
  }

  if (now > record.resetAt) {
    // Window expired, reset
    await prisma.rateLimit.update({
      where: { id: record.id },
      data: {
        count: 1,
        resetAt: new Date(now.getTime() + windowMs),
      },
    });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  // Within window, increment
  await prisma.rateLimit.update({
    where: { id: record.id },
    data: {
      count: { increment: 1 },
    },
  });

  return { success: true, remaining: limit - record.count - 1 };
}
