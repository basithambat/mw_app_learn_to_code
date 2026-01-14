import { getPrismaClient } from './src/config/db';

async function seedAdmin() {
    const prisma = getPrismaClient();

    // P3-01 FIX: Require env var, no hardcoded backdoor UID
    const firebaseUid = process.env.SEED_ADMIN_UID;
    if (!firebaseUid) {
        throw new Error('SEED_ADMIN_UID is required to seed admin user. Set it as an environment variable.');
    }
    const email = 'admin@whatsay.app';

    console.log('Seeding admin user...');

    const user = await prisma.user.upsert({
        where: { firebaseUid },
        update: {
            role: 'ADMIN',
        },
        create: {
            firebaseUid,
            email,
            role: 'ADMIN',
            status: 'active',
            personas: {
                create: {
                    handle: 'admin',
                    displayName: 'Admin',
                    type: 'verified',
                    isDefault: true,
                }
            }
        },
    });

    console.log('Admin user created/updated:', user);

    console.log('Creating sample audit log...');
    await prisma.auditLog.create({
        data: {
            actorId: user.id,
            action: 'SEED_ADMIN',
            entityType: 'User',
            entityId: user.id,
            metadata: { message: 'Database seeded with admin user' }
        }
    });

    console.log('Seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
