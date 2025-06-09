// lib/users.ts
import { prisma } from '@/lib/prisma';

export async function fetchUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}