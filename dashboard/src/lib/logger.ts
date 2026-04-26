import { prisma } from "./prisma";

export async function logAudit({
  action,
  userId,
  siteId,
  details,
}: {
  action: string;
  userId?: string;
  siteId?: string;
  details?: Record<string, any>;
}) {
  try {
    // Sanitize details: remove passwords, tokens, urls, keys
    const sanitizedDetails = { ...details };
    const sensitiveKeys = ['password', 'token', 'siteToken', 'connectionKey', 'DATABASE_URL', 'DIRECT_URL'];
    
    for (const key of Object.keys(sanitizedDetails)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        sanitizedDetails[key] = '[REDACTED]';
      }
    }

    await prisma.auditLog.create({
      data: {
        action,
        userId,
        siteId,
        details: JSON.stringify(sanitizedDetails),
      },
    });
  } catch (error) {
    console.error("Failed to write audit log", error);
  }
}
