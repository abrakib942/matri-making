import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { HashService } from '../src/util/hash.service';
import { BANGLADESH, DIVISIONS } from './seed-data/locations';
import { seedDemoProfiles } from './seed-data/demo-profiles';

const connectionString = `${process.env.POSTGRES_DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const hash = new HashService();

const permissionSubjects = [
  { key: 'role', label: 'Role Management' },
  { key: 'permission', label: 'Permission Management' },
  { key: 'user', label: 'User Management' },
  { key: 'folder', label: 'Folder Management' },
  { key: 'file', label: 'File Management' },
  { key: 'profile', label: 'Profile Management' },
  { key: 'verification', label: 'Verification Management' },
  { key: 'payment', label: 'Payment Management' },
  { key: 'plan', label: 'Plan Management' },
  { key: 'report', label: 'Report Management' },
  { key: 'success-story', label: 'Success Story Management' },
  { key: 'cms', label: 'Content Management' },
  { key: 'ticket', label: 'Support Ticket Management' },
  { key: 'ad', label: 'Advertisement Management' },
];

const permissionActions = ['create', 'read', 'update', 'delete'];

function titleCase(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function seedPermissions() {
  const permissionData = permissionSubjects.flatMap(subject =>
    permissionActions.map(action => ({
      subject: subject.key,
      action,
      description: `${titleCase(action)} ${subject.label}`,
    })),
  );

  await prisma.permission.createMany({
    data: permissionData,
    skipDuplicates: true,
  });

  return prisma.permission.findMany();
}

async function seedRoles() {
  const roles = [
    { name: 'Super Admin', description: 'Full access to every resource and action' },
    { name: 'Admin', description: 'Manage core resources except system-level settings' },
    { name: 'Viewer', description: 'Read-only access to core resources' },
    { name: 'Moderator', description: 'Reviews profiles, verifications, and reports' },
    { name: 'Member', description: 'Registered matrimony member' },
  ];

  return Promise.all(
    roles.map(role =>
      prisma.role.upsert({
        where: { name: role.name },
        update: { description: role.description },
        create: role,
      }),
    ),
  );
}

async function seedRolePermissions(
  permissions: Array<{ id: number; subject: string; action: string }>,
  roles: Array<{ id: number; name: string }>,
) {
  const roleMap = new Map(roles.map(role => [role.name, role]));

  const superAdminRole = roleMap.get('Super Admin');
  const adminRole = roleMap.get('Admin');
  const viewerRole = roleMap.get('Viewer');
  const moderatorRole = roleMap.get('Moderator');

  if (!superAdminRole || !adminRole || !viewerRole || !moderatorRole) {
    throw new Error('Required roles not found');
  }

  const superAdminPermissions = permissions.map(permission => ({
    roleId: superAdminRole.id,
    permissionId: permission.id,
  }));

  const adminPermissions = permissions
    .filter(permission => permission.subject !== 'permission')
    .map(permission => ({
      roleId: adminRole.id,
      permissionId: permission.id,
    }));

  const viewerPermissions = permissions
    .filter(permission => permission.action === 'read')
    .map(permission => ({
      roleId: viewerRole.id,
      permissionId: permission.id,
    }));

  const moderatorSubjects = ['profile', 'verification', 'report', 'ticket'];
  const moderatorPermissions = permissions
    .filter(permission => moderatorSubjects.includes(permission.subject))
    .map(permission => ({
      roleId: moderatorRole.id,
      permissionId: permission.id,
    }));

  await prisma.rolePermission.createMany({
    data: [
      ...superAdminPermissions,
      ...adminPermissions,
      ...viewerPermissions,
      ...moderatorPermissions,
    ],
    skipDuplicates: true,
  });

  return roleMap;
}

async function findOrCreateLocation(data: {
  type: 'COUNTRY' | 'DIVISION' | 'DISTRICT' | 'UPAZILA';
  nameEn: string;
  nameBn: string;
  parentId?: number;
}) {
  const existing = await prisma.location.findFirst({
    where: { type: data.type, nameEn: data.nameEn, parentId: data.parentId ?? null },
  });

  if (existing) {
    if (existing.nameBn !== data.nameBn) {
      return prisma.location.update({ where: { id: existing.id }, data: { nameBn: data.nameBn } });
    }
    return existing;
  }

  return prisma.location.create({ data });
}

async function seedLocations() {
  const country = await findOrCreateLocation({ type: 'COUNTRY', ...BANGLADESH });

  for (const division of DIVISIONS) {
    const divisionRow = await findOrCreateLocation({
      type: 'DIVISION',
      nameEn: division.nameEn,
      nameBn: division.nameBn,
      parentId: country.id,
    });

    for (const district of division.districts) {
      await findOrCreateLocation({
        type: 'DISTRICT',
        nameEn: district.nameEn,
        nameBn: district.nameBn,
        parentId: divisionRow.id,
      });
    }
  }

  console.log('Locations seeded.');
}

async function seedPlansAndPackages() {
  const plans = [
    {
      key: 'premium-monthly',
      nameEn: 'Premium Monthly',
      nameBn: 'প্রিমিয়াম মাসিক',
      descriptionEn: 'Unlimited interests, AI recommendations, advanced filters, visitor insights.',
      descriptionBn: 'আনলিমিটেড আগ্রহ, এআই রিকমেন্ডেশন, অ্যাডভান্সড ফিল্টার, ভিজিটর ইনসাইট।',
      pricePaisa: 49900,
      interval: 'MONTHLY' as const,
      sortOrder: 1,
      features: {
        unlimitedInterests: true,
        aiRecommendations: true,
        advancedFilters: true,
        visitorInsights: true,
        readReceipts: true,
        profileBoost: 1,
        priorityListing: true,
        prioritySupport: true,
        monthlyInterestQuota: -1,
      },
    },
    {
      key: 'premium-quarterly',
      nameEn: 'Premium Quarterly',
      nameBn: 'প্রিমিয়াম ত্রৈমাসিক',
      descriptionEn: 'All premium features for three months at a better price.',
      descriptionBn: 'তিন মাসের জন্য সকল প্রিমিয়াম ফিচার, সাশ্রয়ী মূল্যে।',
      pricePaisa: 129900,
      interval: 'QUARTERLY' as const,
      sortOrder: 2,
      features: {
        unlimitedInterests: true,
        aiRecommendations: true,
        advancedFilters: true,
        visitorInsights: true,
        readReceipts: true,
        profileBoost: 3,
        priorityListing: true,
        prioritySupport: true,
        monthlyInterestQuota: -1,
      },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { key: plan.key },
      update: { ...plan },
      create: { ...plan },
    });
  }

  const packages = [
    {
      key: 'credits-1',
      nameEn: '1 Biodata Unlock',
      nameBn: '১টি বায়োডাটা আনলক',
      credits: 1,
      pricePaisa: 10000,
      sortOrder: 1,
    },
    {
      key: 'credits-5',
      nameEn: '5 Biodata Unlocks',
      nameBn: '৫টি বায়োডাটা আনলক',
      credits: 5,
      pricePaisa: 40000,
      sortOrder: 2,
    },
    {
      key: 'credits-10',
      nameEn: '10 Biodata Unlocks',
      nameBn: '১০টি বায়োডাটা আনলক',
      credits: 10,
      pricePaisa: 70000,
      sortOrder: 3,
    },
  ];

  for (const pkg of packages) {
    await prisma.creditPackage.upsert({
      where: { key: pkg.key },
      update: { ...pkg },
      create: { ...pkg },
    });
  }

  console.log('Plans and credit packages seeded.');
}

async function seedSuperAdminUser(roleMap: Map<string, { id: number; name: string }>) {
  const password = await hash.generateHash('password');

  const superAdminUser = await prisma.user.upsert({
    where: { email: 'super.admin@example.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'super.admin@example.com',
      password,
      phone: '',
      nid: '',
      status: 'ACTIVE',
    },
  });

  const superAdminRole = roleMap.get('Super Admin');
  if (!superAdminRole) {
    throw new Error('Super Admin role not found');
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  });
}

async function main() {
  try {
    const permissions = await seedPermissions();
    const roles = await seedRoles();
    const roleMap = await seedRolePermissions(permissions, roles);
    await seedSuperAdminUser(roleMap);
    await seedLocations();
    await seedPlansAndPackages();
    await seedDemoProfiles(prisma);
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
