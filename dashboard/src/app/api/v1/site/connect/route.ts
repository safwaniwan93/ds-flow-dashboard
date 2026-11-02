import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/logger";
import { normalizePublicSiteUrl } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const headerList = await headers();
    const ip = (headerList.get("x-forwarded-for")?.split(",")[0] || "unknown").trim().slice(0, 64);
    
    // Rate limit: 5 attempts per 15 minutes for site connection
    const limiter = await rateLimit(ip, "site_connect", 5, 15 * 60 * 1000);
    if (!limiter.success) {
      return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 8192) {
      return Response.json({ error: "Request body is too large" }, { status: 413 });
    }

    const body = await req.json();
    const { connectionKey, domain } = body;

    const normalizedDomain = normalizePublicSiteUrl(domain);
    if (typeof connectionKey !== "string" || !/^[a-f0-9]{64}$/i.test(connectionKey) || !normalizedDomain) {
      return Response.json({ error: "Missing connectionKey or domain" }, { status: 400 });
    }

    const connectionKeyHash = crypto.createHash('sha256').update(connectionKey).digest('hex');

    // Find the pending site with this connection key
    const site = await prisma.site.findUnique({
      where: {
        connectionKeyHash: connectionKeyHash,
      },
    });

    if (!site || site.status !== "PENDING") {
      return Response.json({ error: "Invalid connection key" }, { status: 400 });
    }

    if (site.connectionKeyUsedAt !== null) {
      return Response.json({ error: "Connection key has already been used" }, { status: 400 });
    }

    if (site.connectionKeyExpiresAt && site.connectionKeyExpiresAt < new Date()) {
      return Response.json({ error: "Connection key has expired" }, { status: 400 });
    }

    // Check if domain is already connected
    const existingDomain = await prisma.site.findFirst({
      where: {
        domain: normalizedDomain,
        status: "CONNECTED",
      },
    });

    if (existingDomain) {
      return Response.json({ error: "Domain is already connected" }, { status: 400 });
    }

    // Generate a permanent site token
    const siteToken = crypto.randomBytes(32).toString("hex");
    const siteTokenHash = crypto.createHash('sha256').update(siteToken).digest('hex');

    // Update the site record
    const updatedSite = await prisma.site.update({
      where: { id: site.id },
      data: {
        domain: normalizedDomain,
        siteTokenHash,
        connectionKeyUsedAt: new Date(),
        status: "CONNECTED",
      },
    });

    // Auto-create default slots: evergreen-offers, special-promo-offers
    await prisma.promoSection.createMany({
      data: [
        {
          siteId: updatedSite.id,
          slotKey: "evergreen-offers",
          labelText: "Evergreen Offers",
          titleLine1: "Best Sellers",
          themeVariant: "gold",
          status: "DRAFT", // Staff can configure and publish later
        },
        {
          siteId: updatedSite.id,
          slotKey: "special-promo-offers",
          labelText: "Special Promo",
          titleLine1: "Limited Time Offer",
          themeVariant: "red",
          status: "DRAFT",
        },
      ],
      skipDuplicates: true,
    });

    // We only return the plaintext token ONCE
    await logAudit({
      action: "SITE_CONNECTED",
      siteId: updatedSite.id,
      details: { domain: normalizedDomain }
    });

    return Response.json({ siteToken, message: "Site connected successfully" });
  } catch (error) {
    console.error("Error in site connection:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
