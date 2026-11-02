import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { logAudit } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { boundedString, optionalPublicHttpsUrl } from "@/lib/validation";

const MAX_PRODUCTS_PER_SYNC = 500;
const MAX_SYNC_BODY_BYTES = 1024 * 1024;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Missing or invalid Bearer token" }, { status: 401 });
    }

    const siteToken = authHeader.slice(7);
    if (!/^[a-f0-9]{64}$/i.test(siteToken)) {
      return Response.json({ error: "Missing or invalid Bearer token" }, { status: 401 });
    }
    const siteTokenHash = crypto.createHash('sha256').update(siteToken).digest('hex');

    // Find the site
    const site = await prisma.site.findUnique({
      where: { siteTokenHash },
    });

    if (!site || site.status !== "CONNECTED") {
      return Response.json({ error: "Unauthorized or site not connected" }, { status: 401 });
    }

    // Rate limit by site ID: 100 syncs per hour
    const limiter = await rateLimit(site.id, "product_sync", 100, 60 * 60 * 1000);
    if (!limiter.success) {
      return Response.json({ error: "Rate limit exceeded for product sync." }, { status: 429 });
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_SYNC_BODY_BYTES) {
      return Response.json({ error: "Request body is too large" }, { status: 413 });
    }

    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length > MAX_PRODUCTS_PER_SYNC) {
      return Response.json({ error: "Invalid payload format. Expected an array of products." }, { status: 400 });
    }

    // Upsert products for this site
    // Simple iteration for MVP. For production with thousands of products, consider a transaction or raw query.
    for (const p of products) {
      if (!p || typeof p !== "object") continue;

      const wcProductId = boundedString(String(p.wcProductId || ""), 64, "") || "";
      const name = boundedString(p.name, 300, "") || "";
      if (!wcProductId || !name) continue;

      const sku = boundedString(p.sku, 120);
      const price = boundedString(p.price, 32);
      const regularPrice = boundedString(p.regularPrice, 32);
      const activePrice = boundedString(p.activePrice, 32) || price;
      const stockStatus = boundedString(p.stockStatus, 32);
      const image = optionalPublicHttpsUrl(p.image);

      await prisma.product.upsert({
        where: {
          siteId_wcProductId: {
            siteId: site.id,
            wcProductId,
          },
        },
        update: {
          sku,
          name,
          price,
          regularPrice,
          activePrice,
          stockStatus,
          image,
        },
        create: {
          siteId: site.id,
          wcProductId,
          sku,
          name,
          price,
          regularPrice,
          activePrice,
          stockStatus,
          image,
        },
      });
    }

    // Update lastSync timestamp on the site
    await prisma.site.update({
      where: { id: site.id },
      data: { lastSync: new Date() },
    });

    await logAudit({
      action: "PRODUCTS_SYNCED",
      siteId: site.id,
      details: { productCount: products.length }
    });

    return Response.json({ success: true, message: "Products synced successfully" });
  } catch (error) {
    console.error("Error syncing products:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
