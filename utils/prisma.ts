import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  prisma.$connect()
    .then(() => console.log('Database connected successfully'))
    .catch((error) => console.error('Database connection failed:', error));
}

export default prisma;
