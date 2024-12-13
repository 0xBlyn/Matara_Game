import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function migrateReferralCodes() {
  try {
    // Get all users without referral codes
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { referralCode: undefined },
          { referralCode: '' }
        ]
      }
    });

    console.log(`Found ${users.length} users without referral codes`);

    // Update each user individually
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: uuidv4() }
      });
    }

    console.log('Successfully updated all users with unique referral codes');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateReferralCodes(); 