import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { PrismaClient } from '~/generated/prisma/client';
import 'dotenv/config';
import { permissionsList } from '~/layers/shared/app/common/const/permission';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function userSeeder() {
  console.info('Seeding deterministic roles/permissions...');

  const [adminRole, userRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: { name: 'Admin' },
    }),
    prisma.role.upsert({
      where: { name: 'User' },
      update: {},
      create: { name: 'User' },
    }),
  ]);

  for (const permission of permissionsList) {
    await prisma.permissions.upsert({
      where: { key: permission.key },
      update: { name: permission.name },
      create: {
        key: permission.key,
        name: permission.name,
      },
    });
  }

  const insertedPermissions = await prisma.permissions.findMany();

  await prisma.rolePermissions.deleteMany({
    where: {
      role_id: {
        in: [adminRole.id, userRole.id],
      },
    },
  });

  await prisma.rolePermissions.createMany({
    data: insertedPermissions.map((permission) => ({
      role_id: adminRole.id,
      permission_id: permission.id,
    })),
    skipDuplicates: true,
  });

  const [userPass, adminPass] = await Promise.all([bcrypt.hash('userPassword1_', 10), bcrypt.hash('adminPassword1_', 10)]);

  const [defaultUser, adminUser] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'user@gmail.com' },
      update: { name: 'User', password: userPass },
      create: { name: 'User', email: 'user@gmail.com', password: userPass },
    }),
    prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: { name: 'Admin', password: adminPass },
      create: { name: 'Admin', email: 'admin@gmail.com', password: adminPass },
    }),
  ]);

  await prisma.userRoles.deleteMany({
    where: {
      user_id: {
        in: [defaultUser.id, adminUser.id],
      },
    },
  });

  await prisma.userRoles.createMany({
    data: [
      { user_id: defaultUser.id, role_id: userRole.id },
      { user_id: adminUser.id, role_id: adminRole.id },
    ],
    skipDuplicates: true,
  });

  console.info('Seeding User roles/permissions done!');
}
