import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

let prisma: PrismaClient;

export const connectDB = async () => {
  try {
    console.log("DB URL:", process.env.DATABASE_URL);

    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });

    prisma = new PrismaClient({
      adapter, //THIS is the Prisma 7 way
    });

    await prisma.$connect();

    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('DB connection failed:', error);
    process.exit(1);
  }
};

export default prisma;