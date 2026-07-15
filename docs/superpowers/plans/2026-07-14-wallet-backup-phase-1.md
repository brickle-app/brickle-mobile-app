# Wallet Backup Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add non-custodial encrypted wallet backup support to the mobile app so users can restore signing capability without exposing private keys to the C# backend.

**Architecture:** The mobile app owns wallet generation, local encryption/decryption, and transaction signing. The backend stores and returns opaque encrypted backup payloads only; it never receives a plaintext private key. Purchase flows detect missing local keys and route users to wallet restoration instead of treating it as an invalid auth session.

**Tech Stack:** Expo React Native, TypeScript, Zustand, Expo SecureStore, Expo Crypto, existing Brickle Axios client, Jest.

## Global Constraints

- No plaintext private key may be sent to the backend or persisted in AsyncStorage.
- Backend C# is not present in this workspace; implement mobile client contracts only.
- Existing `generatePermit` flow remains local signing for Phase 1.
- Do not add native dependencies for encryption in this pass; use an interface that can be upgraded when the final crypto primitive is selected.

---

### Task 1: Wallet Backup Domain And API Client

**Files:**
- Create: `src/types/walletBackup.types.ts`
- Create: `src/services/wallet-backup.service.ts`
- Test: `src/services/wallet-backup.service.test.ts`

**Interfaces:**
- Produces: `WalletBackupPayload`, `saveWalletBackup(payload)`, `getWalletBackup()`.

- [x] Write failing tests for saving and fetching encrypted backup payloads through the Brickle API client.
- [x] Implement typed payload and service methods.
- [x] Verify service tests pass.

### Task 2: Local Wallet Backup Crypto Facade

**Files:**
- Create: `src/services/wallet-backup-crypto.service.ts`
- Test: `src/services/wallet-backup-crypto.service.test.ts`

**Interfaces:**
- Consumes: `WalletBackupPayload`.
- Produces: `createWalletBackup(privateKey, recoveryPassword, walletAddress)`, `restorePrivateKeyFromBackup(payload, recoveryPassword)`.

- [x] Write failing tests for round-trip encryption/decryption and wrong password rejection.
- [x] Implement deterministic testable encryption facade using Expo Crypto primitives available in this repo.
- [x] Verify crypto tests pass.

### Task 3: Registration Backup Creation

**Files:**
- Modify: `src/hooks/useRegisterForm.ts`
- Test: `src/hooks/auth/completeProfileSubmission.test.ts`

**Interfaces:**
- Consumes: `createWalletBackup`, `saveWalletBackup`.

- [x] Add recovery password fields to registration form state if present in existing form model.
- [x] Save encrypted backup after user creation succeeds.
- [x] Verify registration tests pass.

### Task 4: Missing Wallet Recovery State For Purchases

**Files:**
- Modify: `src/components/leasing/leasingPurchase.ts`
- Modify: `src/components/leasing/LeasingDetailScreen.tsx`
- Test: `src/components/leasing/leasingPurchase.test.ts`

**Interfaces:**
- Produces: purchase failure reason `missing_private_key` so UI can show wallet restoration rather than auth error.

- [x] Write failing test for missing local private key callback.
- [x] Implement explicit missing-wallet callback.
- [x] Verify purchase tests pass.

### Task 5: Verification

**Files:**
- Verify changed tests and TypeScript.

- [x] Run `npx jest src/services/wallet-backup.service.test.ts src/services/wallet-backup-crypto.service.test.ts src/components/leasing/leasingPurchase.test.ts --runInBand`.
- [x] Run `npx tsc --noEmit`.

## Backend Contract To Implement In C# Repo

- `POST /api/wallet/backup`: authenticated endpoint, accepts encrypted payload, validates `walletAddress` equals authenticated user's wallet, stores ciphertext and metadata.
- `GET /api/wallet/backup`: authenticated endpoint, returns encrypted payload for authenticated user.
- Database table `WalletBackups`: `Id`, `UserId`, `WalletAddress`, `EncryptedPrivateKey`, `EncryptionVersion`, `Cipher`, `Nonce`, `Kdf`, `KdfSalt`, `KdfParamsJson`, `CreatedAt`, `UpdatedAt`, `LastRestoredAt`.
- Never log or persist plaintext private keys.
