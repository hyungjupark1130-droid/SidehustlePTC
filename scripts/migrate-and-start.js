'use strict';
// Applies additive schema migrations via raw SQL (no prisma CLI needed at runtime),
// then hands off to the Next.js standalone server.
const { PrismaClient } = require('@prisma/client');

const MIGRATIONS = [
  `ALTER TABLE "Publication" ADD COLUMN IF NOT EXISTS "fontSize" TEXT`,
  `ALTER TABLE "Publication" ADD COLUMN IF NOT EXISTS "lineHeight" TEXT`,
  `ALTER TABLE "Publication" ADD COLUMN IF NOT EXISTS "textAlign" TEXT`,
];

async function run() {
  const prisma = new PrismaClient();
  try {
    for (const sql of MIGRATIONS) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('[startup] schema columns ensured');
  } catch (err) {
    console.warn('[startup] migration warning (non-fatal):', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run()
  .then(() => require('./server.js'))
  .catch((err) => {
    console.error('[startup] fatal migration error:', err);
    process.exit(1);
  });
