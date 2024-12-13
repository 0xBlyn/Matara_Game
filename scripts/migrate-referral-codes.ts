import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function migrateReferralCodes() {
  try {
    await prisma.user.updateMany({
      where: { referralCode: { equals: null } },
      data: { referralCode: uuidv4() }
    });
    console.log('Successfully updated all users with unique referral codes');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateReferralCodes(); 