import { prisma } from "./prisma";

export async function rateLimit(
  identifier: string,
  endpoint: string,
  limit: number,
  windowMs: number,
  attempt = 0,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      const record = await tx.rateLimit.findUnique({
        where: {
          identifier_endpoint: {
            identifier: identifier.slice(0, 320),
            endpoint: endpoint.slice(0, 120),
          },
        },
      });

      if (!record) {
        await tx.rateLimit.create({
          data: {
            identifier: identifier.slice(0, 320),
            endpoint: endpoint.slice(0, 120),
            count: 1,
            resetAt: new Date(now.getTime() + windowMs),
          },
        });
        return { success: true, remaining: limit - 1 };
      }

      if (now > record.resetAt) {
        await tx.rateLimit.update({
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

      const updated = await tx.rateLimit.update({
        where: { id: record.id },
        data: { count: { increment: 1 } },
      });

      return { success: true, remaining: Math.max(0, limit - updated.count) };
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if ((code === "P2002" || code === "P2034") && attempt < 2) {
      return rateLimit(identifier, endpoint, limit, windowMs, attempt + 1);
    }
    throw error;
  }
}
