const { PrismaClient: PrismaClientGenerated } = require('./generated/prisma');

const prisma = new PrismaClientGenerated({
  // İleride loglama veya diğer Prisma Client ayarları için burayı kullanabiliriz.
  // log: ['query', 'info', 'warn', 'error'], // Örneğin, tüm sorguları loglamak için
});

module.exports = prisma;
