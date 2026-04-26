import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function ProductsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  // Fetch synced products respecting role
  const products = await prisma.product.findMany({
    where: session.user.role === "ADMIN" ? undefined : { site: { userId: session.user.id } },
    include: { site: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col gap-10">
      <div className="pb-2 border-b">
        <h1 className="text-4xl font-sans font-bold tracking-tight text-slate-900">Product Catalog</h1>
        <p className="text-muted-foreground mt-1">
          View simple products synced from connected WooCommerce sites.
        </p>
      </div>

      <Card className="shadow-sm border-slate-200/60 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
          <CardTitle className="text-lg font-sans">Synced Products</CardTitle>
          <CardDescription>
            These products are available to be added to your promo sections.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600">Image</TableHead>
                <TableHead className="font-semibold text-slate-600">Name</TableHead>
                <TableHead className="font-semibold text-slate-600">SKU</TableHead>
                <TableHead className="font-semibold text-slate-600">Price</TableHead>
                <TableHead className="font-semibold text-slate-600">Stock Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Source Site</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No products synced yet. Go to your WordPress plugin to run a manual sync.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-slate-100" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku || "-"}</TableCell>
                    <TableCell>{product.price ? `RM ${product.price}` : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={product.stockStatus === "instock" ? "default" : "secondary"}>
                        {product.stockStatus === "instock" ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.site.domain}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
