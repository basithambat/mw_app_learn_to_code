import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      phone: '+919876543210',
      email: 'test@mywasiyat.com',
      fullName: 'Test User',
      acceptedTosAt: new Date(),
      acceptedPrivacyAt: new Date(),
    },
  });

  console.log('Created user:', user.id);

  // Create a test will
  const will = await prisma.will.create({
    data: {
      userId: user.id,
      status: 'DRAFT',
      personalLaw: 'HINDU',
      previousWillExists: false,
      stepBasicInfo: 'COMPLETED',
      stepFamily: 'IN_PROGRESS',
      stepArrangements: 'NOT_STARTED',
      stepAssets: 'NOT_STARTED',
      stepLegalReview: 'NOT_STARTED',
      profile: {
        create: {
          fullName: 'Test User',
          gender: 'MALE',
          dateOfBirth: new Date('1980-01-01'),
          maritalStatus: 'MARRIED',
          religionLabel: 'Hindu',
          personalLaw: 'HINDU',
        },
      },
    },
  });

  console.log('Created will:', will.id);

  // Create test people
  const spouse = await prisma.willPerson.create({
    data: {
      willId: will.id,
      fullName: 'Spouse Name',
      relationship: 'SPOUSE',
      gender: 'FEMALE',
      dateOfBirth: new Date('1982-05-15'),
      isMinor: false,
      email: 'spouse@example.com',
      isBeneficiary: true,
    },
  });

  const child = await prisma.willPerson.create({
    data: {
      willId: will.id,
      fullName: 'Child Name',
      relationship: 'SON',
      gender: 'MALE',
      dateOfBirth: new Date('2010-06-20'),
      isMinor: true,
      isBeneficiary: true,
    },
  });

  console.log('Created people:', spouse.id, child.id);

  // Create executor
  await prisma.executorAssignment.create({
    data: {
      willId: will.id,
      personId: spouse.id,
      isPrimary: true,
    },
  });

  console.log('Created executor assignment');

  // Create witnesses
  await prisma.witness.create({
    data: {
      willId: will.id,
      fullName: 'Witness 1',
      email: 'witness1@example.com',
      phone: '+919876543211',
      status: 'PENDING',
      isBeneficiaryConflict: false,
      isExecutorConflict: false,
    },
  });

  await prisma.witness.create({
    data: {
      willId: will.id,
      fullName: 'Witness 2',
      email: 'witness2@example.com',
      phone: '+919876543212',
      status: 'PENDING',
      isBeneficiaryConflict: false,
      isExecutorConflict: false,
    },
  });

  console.log('Created witnesses');

  // Create inheritance scenario
  await prisma.inheritanceScenario.create({
    data: {
      willId: will.id,
      type: 'USER_DIES_FIRST',
      title: 'If I die before my spouse',
      allocationJson: {
        allocations: [
          { personId: spouse.id, percentage: 50 },
          { personId: child.id, percentage: 50 },
        ],
      },
    },
  });

  console.log('Created inheritance scenario');

  // Create guardian assignment
  await prisma.guardianAssignment.create({
    data: {
      willId: will.id,
      childPersonId: child.id,
      guardianPersonId: spouse.id,
    },
  });

  console.log('Created guardian assignment');

  // Create test asset
  await prisma.asset.create({
    data: {
      willId: will.id,
      category: 'REAL_ESTATE',
      title: 'House in Mumbai',
      description: '3BHK apartment',
      ownershipType: 'SELF_ACQUIRED',
      ownershipShare: 100,
      estimatedValue: 5000000,
      currency: 'INR',
      metadataJson: {
        address: 'Mumbai, Maharashtra',
        area: '1200 sq ft',
      },
      transferToJson: {
        beneficiaries: [
          { personId: spouse.id, percentage: 100 },
        ],
      },
    },
  });

  console.log('Created asset');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
