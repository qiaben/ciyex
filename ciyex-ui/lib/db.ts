import { prisma } from "@/lib/prisma";

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;