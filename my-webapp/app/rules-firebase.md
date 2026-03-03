rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ===== USERS =====
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }

    // ===== CAMPAIGNS =====
    match /campaigns/{campaignId} {
      // Read: allow any signed-in user (required for join to validate password)
      allow read: if request.auth != null;

      // Create: any authenticated user
      allow create: if request.auth != null;

      // Update rules:
      // - DM can update anything
      // - Members can update (shared loot, etc.)
      // - Non-members can only join by adding themselves to playerIds (+ updatedAt)
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.dmId ||
        request.auth.uid in resource.data.playerIds ||
        (
          request.resource.data.diff(resource.data).affectedKeys()
            .hasOnly(['playerIds','updatedAt']) &&
          request.resource.data.playerIds.hasAll(resource.data.playerIds) &&
          request.resource.data.playerIds.size() == resource.data.playerIds.size() + 1 &&
          request.auth.uid in request.resource.data.playerIds
        )
      );

      // Delete: only DM
      allow delete: if request.auth != null && request.auth.uid == resource.data.dmId;

      // ===== PLAYER INVENTORIES SUBCOLLECTION =====
      match /playerInventories/{playerId} {
        // Read: any campaign member
        allow read: if request.auth != null && (
          request.auth.uid in get(/databases/$(database)/documents/campaigns/$(campaignId)).data.playerIds ||
          request.auth.uid == get(/databases/$(database)/documents/campaigns/$(campaignId)).data.dmId
        );

        // Create/Update: DM or the player whose inventory it is
        allow create, update: if request.auth != null && (
          request.auth.uid == get(/databases/$(database)/documents/campaigns/$(campaignId)).data.dmId ||
          request.auth.uid == playerId
        );

        // Delete: only DM
        allow delete: if request.auth != null &&
          request.auth.uid == get(/databases/$(database)/documents/campaigns/$(campaignId)).data.dmId;
      }

      // ===== TRANSFER REQUESTS SUBCOLLECTION =====
      match /transferRequests/{requestId} {
        // Read: sender or recipient of the transfer, or DM
        allow read: if request.auth != null && (
          request.auth.uid == resource.data.fromPlayerId ||
          request.auth.uid == resource.data.toPlayerId ||
          request.auth.uid == get(/databases/$(database)/documents/campaigns/$(campaignId)).data.dmId
        );

        // Create: any campaign member (as sender)
        allow create: if request.auth != null && (
          request.auth.uid in get(/databases/$(database)/documents/campaigns/$(campaignId)).data.playerIds ||
          request.auth.uid == get(/databases/$(database)/documents/campaigns/$(campaignId)).data.dmId
        ) && request.resource.data.fromPlayerId == request.auth.uid;

        // Update: recipient can update status to 'rejected', sender or DM can update
        allow update: if request.auth != null && (
          // Recipient can only change status to 'rejected'
          (request.auth.uid == resource.data.toPlayerId &&
           request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']) &&
           request.resource.data.status == 'rejected') ||
          // Sender can update their own request
          request.auth.uid == resource.data.fromPlayerId ||
          // DM can update any request
          request.auth.uid == get(/databases/$(database)/documents/campaigns/$(campaignId)).data.dmId
        );

        // Delete: sender, recipient, or DM
        allow delete: if request.auth != null && (
          request.auth.uid == resource.data.fromPlayerId ||
          request.auth.uid == resource.data.toPlayerId ||
          request.auth.uid == get(/databases/$(database)/documents/campaigns/$(campaignId)).data.dmId
        );
      }
    }
  }
}