import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a random connection key
    const connectionKey = crypto.randomBytes(16).toString("hex");

    // Create a new Site record in PENDING state
    const site = await prisma.site.create({
      data: {
        connectionKey,
        status: "PENDING",
        userId: session.user.id,
      },
    });

    return Response.json({ connectionKey, siteId: site.id });
  } catch (error) {
    console.error("Error generating connection key:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
