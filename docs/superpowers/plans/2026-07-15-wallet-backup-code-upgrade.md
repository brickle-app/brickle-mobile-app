# Wallet Backup Code Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace password-based wallet backups with backup-code secured wallets and force legacy users through a wallet upgrade before purchase/signature flows.

**Architecture:** Mobile generates a new wallet and high-entropy backup code, encrypts the private key locally, and sends only the encrypted backup to the API. The API exposes an authenticated upgrade endpoint that updates the user active wallet address and upserts the encrypted backup atomically. Purchase flows call a local security gate before signing.

**Tech Stack:** Expo React Native, ethers, SecureStore/auth services, ASP.NET Core API, EF repositories, xUnit/Jest tests.

## Global Constraints

- Backend must never receive or store plaintext private keys or backup codes.
- Legacy users without a secure backup-code wallet are blocked from purchase/signature flows until upgrade.
- New and upgraded users use the same active wallet + encrypted backup model.
- Private key persistence in SecureStore is temporary compatibility only; final flow moves toward in-memory unlock.

---

### Task 1: Backend Wallet Upgrade Endpoint

**Files:**
- Modify: `/Volumes/B/Projects/Brickle/BricklePlatform-api/src/BricklePlatform.Domain/Interfaces/IWalletBackupService.cs`
- Modify: `/Volumes/B/Projects/Brickle/BricklePlatform-api/src/BricklePlatform.Infrastructure/Services/WalletBackupService.cs`
- Modify: `/Volumes/B/Projects/Brickle/BricklePlatform-api/src/BricklePlatform.Api/Controllers/WalletController.cs`
- Test: `/Volumes/B/Projects/Brickle/BricklePlatform-api/test/BricklePlatform.Test/Services/WalletBackupServiceTests.cs`
- Test: `/Volumes/B/Projects/Brickle/BricklePlatform-api/test/BricklePlatform.Test/Controllers/WalletControllerTests.cs`

**Interfaces:**
- Produces: `Task<WalletBackupResponseDto> UpgradeActiveWalletAsync(Guid userId, WalletBackupRequestDto request)`.
- Produces: `POST /api/wallet/backup/upgrade`.

- [ ] Write failing service tests proving upgrade updates `User.WalletAddress` and upserts encrypted backup.
- [ ] Write failing controller test proving `POST /api/wallet/backup/upgrade` returns `200 OK`.
- [ ] Implement `UpgradeActiveWalletAsync` with existing validation plus wallet address uniqueness check.
- [ ] Run `dotnet test "test/BricklePlatform.Test/BricklePlatform.Test.csproj" --filter "WalletBackupServiceTests|WalletControllerTests"`.

### Task 2: Mobile Backup Code Services

**Files:**
- Create: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/services/wallet-backup-code.service.ts`
- Modify: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/services/wallet-backup-crypto.service.ts`
- Modify: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/services/wallet-backup.service.ts`
- Test: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/services/wallet-backup-code.service.test.ts`
- Test: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/services/wallet-backup-crypto.service.test.ts`
- Test: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/services/wallet-backup.service.test.ts`

**Interfaces:**
- Produces: `generateWalletBackupCode(): string`.
- Produces: `createWalletBackupWithBackupCode({ privateKey, backupCode, walletAddress })`.
- Produces: `upgradeWalletBackup(payload)`.

- [ ] Write failing tests for backup code format and encryption with backup code.
- [ ] Implement backup code generation and aliases around existing encryption.
- [ ] Add API client for `POST /api/wallet/backup/upgrade`.
- [ ] Run wallet service Jest tests.

### Task 3: Mobile Mandatory Upgrade Flow

**Files:**
- Create: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/services/wallet-upgrade.service.ts`
- Create: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/services/wallet-security-gate.service.ts`
- Create: `/Volumes/B/Projects/Brickle/bloom-mobile-app/app/(stack)/wallet-upgrade.tsx`
- Modify: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/components/leasing/leasingPurchase.ts`
- Test: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/services/wallet-upgrade.service.test.ts`
- Test: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/services/wallet-security-gate.service.test.ts`
- Test: `/Volumes/B/Projects/Brickle/bloom-mobile-app/src/components/leasing/leasingPurchase.test.ts`

**Interfaces:**
- Produces: `createSecureWalletUpgrade()` returns wallet address and backup code.
- Produces: `ensureWalletReadyForSigning()` returns `ready | upgradeRequired | restoreRequired`.
- Consumes: `upgradeWalletBackup(payload)`.

- [ ] Write failing tests for upgrade generation and mandatory gate behavior.
- [ ] Implement upgrade service using `ethers.Wallet.createRandom()`.
- [ ] Implement upgrade screen with backup-code confirmation.
- [ ] Block purchase flows when upgrade is required and navigate to wallet upgrade.
- [ ] Run Jest tests and `npx tsc --noEmit`.

### Task 4: Verification

- [ ] Run backend focused tests and build.
- [ ] Run mobile focused tests and TypeScript check.
- [ ] Summarize any remaining manual QA: new user registration, legacy purchase block, wallet upgrade, restore with backup code.
