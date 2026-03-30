/**
 * Migration script: Rename dm* fields to gm* in Firestore
 *
 * Renames:
 *   campaigns: dmId → gmId, dmName → gmName
 *   users: dmCampaigns → gmCampaigns
 *
 * Usage:
 *   npx ts-node scripts/migrate-dm-to-gm.ts
 *
 * Or run it from the browser console / a temporary API route
 * by copying the logic below.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize with your service account key
// Download from Firebase Console > Project Settings > Service Accounts
initializeApp({
  credential: cert('./itemstorage-cd026-firebase-adminsdk-fbsvc-a0c81db13a.json'),
});

const db = getFirestore();

async function migrateCampaigns() {
  const snap = await db.collection('campaigns').get();
  let count = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.dmId !== undefined || data.dmName !== undefined) {
      await doc.ref.update({
        gmId: data.dmId ?? FieldValue.delete(),
        gmName: data.dmName ?? FieldValue.delete(),
        dmId: FieldValue.delete(),
        dmName: FieldValue.delete(),
      });
      count++;
    }
  }

  console.log(`Migrated ${count} campaign documents.`);
}

async function migrateUsers() {
  const snap = await db.collection('users').get();
  let count = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.dmCampaigns !== undefined) {
      await doc.ref.update({
        gmCampaigns: data.dmCampaigns,
        dmCampaigns: FieldValue.delete(),
      });
      count++;
    }
  }

  console.log(`Migrated ${count} user documents.`);
}

async function main() {
  console.log('Starting dm → gm field migration...');
  await migrateCampaigns();
  await migrateUsers();
  console.log('Migration complete.');
}

main().catch(console.error);
