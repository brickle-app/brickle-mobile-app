# Profile Document CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show users a clear next step after completing basic profile data: upload an identity document for validation, and rebalance the complete-profile wizard into two useful steps.

**Architecture:** Add small pure helpers for profile verification state and wizard field grouping so behavior is testable without rendering native UI. Reuse the existing `ProfileCompletionModal` upload flow from dashboard and wallet, and add a focused dashboard CTA card when a document is still needed.

**Tech Stack:** React Native, Expo Router, Nativewind-style classes, Zustand `authStore`, Jest.

## Global Constraints

- Do not add new dependencies.
- Keep the existing document upload modal and backend endpoints.
- Dashboard CTA appears when `isBasicProfileComplete === true`, `isFullProfileComplete !== true`, and `isProfileUnderReview !== true`.
- Rebalance complete profile into two steps: personal data first, identification second.
- Use TDD for behavior helpers and run Jest/lint/typecheck before completion.

---

### Task 1: Verification State Helper

**Files:**
- Create: `src/utils/profileVerification.ts`
- Test: `src/utils/profileVerification.test.ts`

**Interfaces:**
- Produces: `needsIdentityDocument(user?: Pick<PartialBrickleUser, "isBasicProfileComplete" | "isFullProfileComplete" | "isProfileUnderReview"> | null): boolean`

- [ ] Write failing tests for users who need a document, are under review, are fully complete, or have no basic profile.
- [ ] Run `npx jest src/utils/profileVerification.test.ts --runInBand` and confirm RED.
- [ ] Implement the helper.
- [ ] Run focused tests and confirm GREEN.

### Task 2: Complete Profile Step Grouping

**Files:**
- Create: `src/hooks/auth/completeProfileSteps.ts`
- Modify: `src/hooks/auth/useCompleteProfileForm.ts`
- Test: `src/hooks/auth/completeProfileSteps.test.ts`

**Interfaces:**
- Produces: `completeProfileSteps`, where step 1 has `firstName`, `lastName`, `phoneNumber`, `birthDate`; step 2 has `nationality`, `residenceCountry`, `documentType`, `documentNumber`.

- [ ] Write a failing test asserting the exact two-step field split.
- [ ] Run focused test and confirm RED.
- [ ] Move the step definition to the helper file and import it in `useCompleteProfileForm`.
- [ ] Run focused test and confirm GREEN.

### Task 3: Dashboard Document CTA

**Files:**
- Create: `src/components/dashboard/ProfileDocumentCta.tsx`
- Modify: `app/(stack)/(tabs)/dashboard/index.tsx`

**Interfaces:**
- Consumes: `needsIdentityDocument(user)` and existing `ProfileCompletionModal` callbacks.
- Produces: CTA card with `onPress` opening `ProfileCompletionModal`.

- [ ] Add the CTA component with concise copy: title `Sube tu documento`, body explaining validation, and button text `Subir documento`.
- [ ] Render it after the dashboard header when `needsIdentityDocument(user)` is true.
- [ ] Reuse `handleCompleteProfile` to open the existing upload modal.

### Task 4: Verification

**Files:**
- All touched files.

- [ ] Run `npx jest --runInBand`.
- [ ] Run `npm run lint`.
- [ ] Run `npx tsc --noEmit` and document pre-existing type failures if still present.
- [ ] Run `npm run ios` and confirm the build succeeds; observe dashboard CTA and modal behavior from logs/manual interaction.
