import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
async function main() {
  await prisma.$connect();

  await prisma.user.create({
    data: {
      name: 'Admin Mouts',
      email: 'admin@mouts.com',
      password: await bcrypt.hash('12345', 12),
    },
  });

  await prisma.$disconnect();
}

void main();
