import { prisma } from './src/lib/prisma';
async function main() {
  const sites = await prisma.site.findMany();
  console.log("SITES: ", sites);
}
main();
