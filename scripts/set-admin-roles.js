const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setAdminRoles() {
  try {
    console.log('🔧 Setting admin roles for specified users...');

    const adminEmails = ['gabrielpantojarivera@gmail.com', 'monacaniqueo@gmail.com'];

    for (const email of adminEmails) {
      console.log(`⚡ Updating user: ${email}`);
      
      const result = await prisma.user.updateMany({
        where: { email: email },
        data: { role: 'admin' }
      });

      if (result.count > 0) {
        console.log(`✅ Successfully set admin role for ${email}`);
      } else {
        console.log(`⚠️  User ${email} not found in database`);
      }
    }

    // Verificar usuarios con rol admin
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { email: true, role: true, name: true }
    });

    console.log('\n📋 Current admin users:');
    adminUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.name || 'Sin nombre'}) - Role: ${user.role}`);
    });

    console.log('\n🎉 Admin roles setup completed!');
  } catch (error) {
    console.error('❌ Error setting admin roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminRoles();