import type { PrismaClient } from '~/generated/prisma/client';
import { AssetKind, AssetVisibility } from '~/generated/prisma/enums';

interface MediaSeedInput {
  ownerId: number;
}

export async function seedMedia(prisma: PrismaClient, input: MediaSeedInput) {
  console.info('Seeding Media domain...');

  const coverAsset = await prisma.mediaAsset.upsert({
    where: { objectKey: 'seed/covers/nuxt-marketplace.png' },
    update: {
      publicUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      visibility: AssetVisibility.PUBLIC,
    },
    create: {
      ownerId: input.ownerId,
      bucket: 'external',
      objectKey: 'seed/covers/nuxt-marketplace.png',
      originalFileName: 'nuxt-marketplace.png',
      mimeType: 'image/png',
      sizeBytes: 512000,
      assetKind: AssetKind.COVER_IMAGE,
      visibility: AssetVisibility.PUBLIC,
      publicUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    },
  });

  return { coverAsset };
}
