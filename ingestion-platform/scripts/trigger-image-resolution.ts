/**
 * Script to trigger image resolution for all content items that don't have images
 * Run: npx tsx scripts/trigger-image-resolution.ts
 */

import { getPrismaClient } from '../src/config/db';
import { imageQueue } from '../src/queue/setup';

const prisma = getPrismaClient();

async function triggerImageResolution() {
  console.log('🔍 Finding content items without images...');

  // Find all items that need image resolution
  const itemsWithoutImages = await prisma.contentItem.findMany({
    where: {
      OR: [
        { imageStorageUrl: null },
        { 
          AND: [
            { imageStatus: { notIn: ['og_used', 'web_found', 'generated'] } },
            { imageStorageUrl: null }
          ]
        },
      ],
    },
    select: {
      id: true,
      titleOriginal: true,
      imageStatus: true,
      imageStorageUrl: true,
    },
    take: 100, // Process in batches
  });

  console.log(`📦 Found ${itemsWithoutImages.length} items without images`);

  if (itemsWithoutImages.length === 0) {
    console.log('✅ All items already have images!');
    process.exit(0);
  }

  console.log('🚀 Triggering image resolution jobs...');

  let successCount = 0;
  let errorCount = 0;

  for (const item of itemsWithoutImages) {
    try {
      // Use a dummy runId for manual triggers
      const runId = `manual-image-${Date.now()}-${item.id}`;
      
      await imageQueue.add('resolve-image', {
        contentId: item.id,
        runId,
      });
      
      successCount++;
      
      if (successCount % 10 === 0) {
        console.log(`  ✓ Queued ${successCount} jobs...`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to queue job for ${item.id}:`, error);
      errorCount++;
    }
  }

  console.log('\n✅ Done!');
  console.log(`   Queued: ${successCount} jobs`);
  console.log(`   Errors: ${errorCount}`);
  console.log('\n💡 Check worker logs to see image resolution progress.');
  console.log('   Images will be available in the API once processed.');

  await prisma.$disconnect();
  process.exit(0);
}

triggerImageResolution().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
