import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { logAudit } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Missing or invalid Bearer token" }, { status: 401 });
    }

    const siteToken = authHeader.split(" ")[1];
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

    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return Response.json({ error: "Invalid payload format. Expected an array of products." }, { status: 400 });
    }

    // Upsert products for this site
    // Simple iteration for MVP. For production with thousands of products, consider a transaction or raw query.
    for (const p of products) {
      if (!p.wcProductId || !p.name) continue;

      await prisma.product.upsert({
        where: {
          siteId_wcProductId: {
            siteId: site.id,
            wcProductId: String(p.wcProductId),
          },
        },
        update: {
          sku: p.sku || null,
          name: p.name,
          price: p.price || null,
          regularPrice: p.regularPrice || null,
          activePrice: p.activePrice || p.price || null,
          stockStatus: p.stockStatus || null,
          image: p.image || null,
        },
        create: {
          siteId: site.id,
          wcProductId: String(p.wcProductId),
          sku: p.sku || null,
          name: p.name,
          price: p.price || null,
          regularPrice: p.regularPrice || null,
          activePrice: p.activePrice || p.price || null,
          stockStatus: p.stockStatus || null,
          image: p.image || null,
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
