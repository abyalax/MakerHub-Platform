import type { PrismaClient } from '~/generated/prisma/client';
import bcrypt from 'bcrypt';
import { permissionsList } from '~/layers/shared/app/common/const/permission';

export async function seedIam(prisma: PrismaClient) {
  console.info('Seeding IAM domain (Roles, Permissions, and Users)...');

  // 1. Upsert Roles
  const [adminRole, learnerRole, mentorRole] = await Promise.all([
    prisma.role.upsert({ where: { name: 'Admin' }, update: {}, create: { name: 'Admin' } }),
    prisma.role.upsert({ where: { name: 'Learner' }, update: {}, create: { name: 'Learner' } }),
    prisma.role.upsert({ where: { name: 'Mentor' }, update: {}, create: { name: 'Mentor' } }),
  ]);

  await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: { name: 'User' },
  });

  // 2. Upsert Permissions
  for (const permission of permissionsList) {
    await prisma.permissions.upsert({
      where: { key: permission.key },
      update: { name: permission.name },
      create: { key: permission.key, name: permission.name },
    });
  }

  const insertedPermissions = await prisma.permissions.findMany();

  // 3. Clear and Reassign Role Permissions
  await prisma.rolePermissions.deleteMany({
    where: {
      role_id: { in: [adminRole.id, learnerRole.id, mentorRole.id] },
    },
  });

  const permissionByKey = new Map(insertedPermissions.map((p) => [p.key, p]));
  const mentorPermissionKeys = [
    'project:create',
    'project:read-own',
    'project:update-own',
    'project:publish-own',
    'project:archive-own',
    'media:create',
    'media:read-own',
  ];

  await prisma.rolePermissions.createMany({
    data: [
      ...insertedPermissions.map((permission) => ({
        role_id: adminRole.id,
        permission_id: permission.id,
      })),
      ...mentorPermissionKeys
        .map((key) => permissionByKey.get(key))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .map((permission) => ({
          role_id: mentorRole.id,
          permission_id: permission.id,
        })),
    ],
    skipDuplicates: true,
  });

  // 4. Upsert Users
  const [learnerPass, mentorPass, adminPass] = await Promise.all([
    bcrypt.hash('learnerPassword1_', 10),
    bcrypt.hash('mentorPassword1_', 10),
    bcrypt.hash('adminPassword1_', 10),
  ]);

  const [learnerUser, mentorUser, adminUser] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'learner@gmail.com' },
      update: { name: 'Learner', password: learnerPass },
      create: { name: 'Learner', email: 'learner@gmail.com', password: learnerPass },
    }),
    prisma.user.upsert({
      where: { email: 'mentor@gmail.com' },
      update: { name: 'Ari Mentor', password: mentorPass },
      create: { name: 'Ari Mentor', email: 'mentor@gmail.com', password: mentorPass },
    }),
    prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: { name: 'Admin', password: adminPass },
      create: { name: 'Admin', email: 'admin@gmail.com', password: adminPass },
    }),
  ]);

  // 5. Assign Roles to Users
  await prisma.userRoles.deleteMany({
    where: {
      user_id: { in: [learnerUser.id, mentorUser.id, adminUser.id] },
    },
  });

  await prisma.userRoles.createMany({
    data: [
      { user_id: learnerUser.id, role_id: learnerRole.id },
      { user_id: mentorUser.id, role_id: mentorRole.id },
      { user_id: adminUser.id, role_id: adminRole.id },
    ],
    skipDuplicates: true,
  });

  return { learnerUser, mentorUser, adminUser };
}
