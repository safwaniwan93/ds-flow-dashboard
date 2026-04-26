import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Missing or invalid Bearer token" }, { status: 401 });
    }

    const siteToken = authHeader.split(" ")[1];

    // Find the site
    const site = await prisma.site.findUnique({
      where: { siteToken },
    });

    if (!site || site.status !== "CONNECTED") {
      return Response.json({ error: "Unauthorized or site not connected" }, { status: 401 });
    }

    // Fetch published promo sections and their visible cards
    const promoSections = await prisma.promoSection.findMany({
      where: {
        siteId: site.id,
        status: "PUBLISHED",
      },
      include: {
        cards: {
          where: { visible: true },
          orderBy: { sortOrder: "asc" },
          include: {
            product: true, // Need product details (e.g., fallback image)
          },
        },
      },
    });

    // Calculate versioning based on the latest updatedAt timestamp
    let lastUpdated = new Date(0);
    promoSections.forEach((section) => {
      if (section.updatedAt > lastUpdated) {
        lastUpdated = section.updatedAt;
      }
      section.cards.forEach((card) => {
        if (card.updatedAt > lastUpdated) {
          lastUpdated = card.updatedAt;
        }
      });
    });

    // If no sections, lastUpdated is site creation time
    if (lastUpdated.getTime() === 0) {
      lastUpdated = site.createdAt;
    }

    const version = lastUpdated.getTime().toString(); // Use epoch as version string

    // Structure the JSON cleanly
    const config = promoSections.reduce((acc, section) => {
      acc[section.slotKey] = {
        labelText: section.labelText,
        titleLine1: section.titleLine1,
        titleLine2: section.titleLine2,
        description: section.description,
        themeVariant: section.themeVariant,
        cards: section.cards.map((card) => {
          const activePriceRaw = card.priceOverride || card.product.activePrice || card.product.price || "0";
          const regularPriceRaw = card.regularPriceOverride || card.product.regularPrice || card.product.price || "0";
          
          const activePrice = parseFloat(activePriceRaw);
          const regularPrice = parseFloat(regularPriceRaw);
          const savingsAmount = regularPrice > activePrice ? (regularPrice - activePrice) : 0;
          return {
            wcProductId: card.product.wcProductId,
            cardTitle: card.cardTitle,
            topLabel: card.topLabel,
            promoChip: card.promoChip,
            miniOfferText: card.miniOfferText,
            poster: card.posterOverride || card.product?.image || "", // Fallback to WC image
            featureList: card.featureList ? card.featureList.split('\n').filter(Boolean) : [],
            buttonText: card.buttonText,
            activePrice: activePriceRaw,
            regularPrice: regularPriceRaw,
            savingsAmount: savingsAmount > 0 ? savingsAmount : null,
            checkoutUrl: `${site.domain}?add-to-cart=${card.product.wcProductId}`,
          };
        }),
      };
      return acc;
    }, {} as Record<string, any>);

    return Response.json({
      version,
      last_updated: lastUpdated.toISOString(),
      config,
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
