# Profile, Legal Consent, and Minimum Investment Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mobile app's split profile/document flow with an idempotent six-step profile submission wizard, require current legal consent before investment, and enforce/display the COP 1,000,000 per-operation minimum with asset-specific ceiling-derived brick counts.

**Architecture:** The API remains authoritative for profile state, legal versions, document ownership, and investment eligibility. Mobile stages typed front, back, and signature documents through the existing upload endpoint, then sends one immutable profile submission or one reconsent package; pure payload, validation, policy, and error-routing functions isolate business behavior for Jest-first TDD. Existing profile-upload functionality remains in place until the replacement wizard and routing tests pass, then its callers and implementation are removed together.

**Tech Stack:** Expo 53, React Native 0.79, React 19, Expo Router 5, TypeScript strict mode, Axios, Zustand, Zod, React Native SVG, `react-native-view-shot`, Jest 29 with `jest-expo`, NativeWind.

## Global Constraints

- Implement only the mobile repository at `/Volumes/B/Projects/Brickle/bloom-mobile-app`; assume the approved API contract is deployed first.
- The minimum for every investment operation is exactly COP 1,000,000.
- Calculate visible minimum bricks as `Math.ceil(1_000_000 / pricePerToken)`; one brick is not globally equivalent to one COP amount.
- Bricks are positive indivisible integers. For a selected brick count, send and display `amount = bricks * pricePerToken`.
- Mobile checks improve UX but never replace API enforcement.
- Perform local brick/minimum validation before wallet readiness, permit generation, or `commitFunds`.
- Initial profile submission requires personal data, identification data, identity front, identity back, three separate active legal acceptances, and one handwritten signature.
- Fetch active legal versions from `GET /api/legal-documents/active`; never hardcode official URLs, IDs, versions, effective dates, or hashes in updated flows.
- Upload each artifact with existing `POST /api/User/documents`, multipart fields `UserId`, `Name`, `File`, and required `DocumentKind` (`IdentityFront`, `IdentityBack`, or `Signature`). Retain the returned document `id`.
- Submit profiles with `POST /api/User/{userId}/profile-submissions` and header `Idempotency-Key: <uuid>`.
- Submit reconsent with `POST /api/User/{userId}/legal-acceptances` and header `Idempotency-Key: <uuid>`; reconsent never requests identity files.
- Retry the same unchanged profile or reconsent payload with the same idempotency key. Generate a new key only after success or an explicit full-flow reset.
- Profile submission statuses are exactly `UnderReview`, `Approved`, and `Rejected`.
- Never infer legal acceptance from `termsAccepted`, opening a document, or an existing approved profile.
- Never write `termsAccepted`, `isBasicProfileComplete`, `isFullProfileComplete`, or `isProfileUnderReview` from the replacement flow. Refresh API-owned user state only after API success.
- Existing approved users may navigate normally. Route them to reconsent only when they attempt to invest and current legal evidence is missing or outdated.
- Preserve the API error response property `code`, human-readable `message`, and HTTP status. Do not reduce failures to `false`.
- Preserve these codes exactly: `INVESTMENT_BELOW_MINIMUM`, `INVESTMENT_AMOUNT_BRICKS_MISMATCH`, `INVALID_BRICKS_COUNT`, `PROFILE_NOT_APPROVED`, `LEGAL_REACCEPTANCE_REQUIRED`, `LEGAL_VERSION_OUTDATED`, `PROFILE_SUBMISSION_INCOMPLETE`, `DOCUMENT_KIND_MISMATCH`, `DOCUMENT_NOT_OWNED`, `STALE_PROFILE_SUBMISSION`, and `IDEMPOTENCY_KEY_REUSED`.
- `LEGAL_REACCEPTANCE_REQUIRED` and `LEGAL_VERSION_OUTDATED` route to reconsent. `PROFILE_NOT_APPROVED` and `PROFILE_SUBMISSION_INCOMPLETE` route to the profile flow. Investment arithmetic errors stay in the purchase UI.
- Do not require users to open legal documents before accepting them.
- Do not change recharge minimums or treat campaign `MinCapital` as the per-operation investment minimum.
- Use integer COP values in mobile state and requests. Do not introduce fractional-brick coercion or truncation.
- Follow strict red-green-refactor: write one focused failing test, verify the expected failure, add the minimum production behavior, and rerun focused plus related tests before each commit.
- Use `Pressable` for new interactions, safe-area-aware scrolling, existing NativeWind styles, and existing Expo Router conventions.

---

## File Map

| Path | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add Expo-compatible `react-native-view-shot`. |
| `bun.lock` | Modify | Lock the added native dependency. |
| `src/types/legal-consent.types.ts` | Create | Legal versions, document kinds, uploads, submissions, reconsent, and eligibility DTOs. |
| `src/types/user.types.ts` | Modify | Add API-projected profile/legal state and exclude server-owned flags from updates. |
| `src/services/brickle-api-error.ts` | Create | Preserve API `code`, `message`, and status. |
| `src/services/brickle-api-error.test.ts` | Create | Error conversion tests. |
| `src/services/profile-consent.service.ts` | Create | Active legal registry, staged upload, profile submission, and reconsent requests. |
| `src/services/profile-consent.service.test.ts` | Create | Exact endpoint, multipart, returned-ID, and idempotency tests. |
| `src/schemes/complete-profile-scheme.ts` | Modify | Six-step and final aggregate validation. |
| `src/schemes/complete-profile-scheme.test.ts` | Create | Missing evidence/acceptance/signature tests. |
| `src/hooks/auth/completeProfileSteps.ts` | Modify | Ordered six-step metadata. |
| `src/hooks/auth/completeProfileSteps.test.ts` | Modify | Wizard order and field ownership tests. |
| `src/hooks/auth/completeProfileSubmission.ts` | Modify | Build aggregate profile payload instead of user-update payload. |
| `src/hooks/auth/completeProfileSubmission.test.ts` | Modify | Exact aggregate and forbidden-field tests. |
| `src/hooks/auth/useCompleteProfileForm.ts` | Modify | Wizard orchestration, uploads, legal fetch, signature, idempotency, submission, refresh. |
| `src/components/auth/completeProfileForm/CompleteProfileForm.tsx` | Modify | Render all six wizard stages. |
| `src/components/auth/completeProfileForm/ProfileEvidenceStep.tsx` | Create | Independent identity front/back pick and upload controls. |
| `src/components/auth/completeProfileForm/ProfileSummaryStep.tsx` | Create | Read-only final summary. |
| `src/components/legal/LegalAcceptanceList.tsx` | Create | Three API-backed links and separate acceptance controls. |
| `src/components/legal/SignaturePad.tsx` | Create | Handwritten SVG strokes and PNG capture. |
| `src/hooks/legal/legalReconsentSubmission.ts` | Create | Pure reconsent request builder. |
| `src/hooks/legal/legalReconsentSubmission.test.ts` | Create | Exact package and completeness tests. |
| `src/hooks/legal/useLegalReconsent.ts` | Create | Reconsent orchestration and idempotency. |
| `src/components/legal/LegalReconsentScreen.tsx` | Create | Investment-time legal acceptance and signature UI. |
| `app/(stack)/legal-reconsent.tsx` | Create | Reconsent route entry. |
| `app/(stack)/_layout.tsx` | Modify | Register reconsent route. |
| `src/constants/legal-documents.ts` | Modify | Keep type-to-Spanish-label map; remove official URL constants after API-backed consumers pass. |
| `app/(stack)/(tabs)/profile/legal-documents/index.tsx` | Modify | Display three active API documents. |
| `src/hooks/dashboard/dashboardProfileAction.ts` | Modify | Use unified wizard rather than one-file upload action. |
| `src/hooks/dashboard/dashboardProfileAction.test.ts` | Modify | Unified-flow routing tests. |
| `app/(stack)/(tabs)/dashboard/index.tsx` | Modify | Route profile CTA to wizard after replacement coverage passes. |
| `app/(stack)/(tabs)/wallet/index.tsx` | Modify | Route profile CTA to wizard after replacement coverage passes. |
| `src/components/dashboard/ProfileDocumentCta.tsx` | Modify | Explain complete evidence package. |
| `src/components/ui/modal/ProfileCompletionModal.tsx` | Delete last | Remove legacy one-file/client-owned review transition only after replacement tests pass. |
| `src/constants/investment-policy.ts` | Create | COP 1,000,000 constant. |
| `src/utils/investment-policy.ts` | Create | Minimum brick calculation and purchase selection validation. |
| `src/utils/investment-policy.test.ts` | Create | Ceiling, integer, minimum, and inventory tests. |
| `src/services/investment-error-action.ts` | Create | Stable API code to message/navigation mapping. |
| `src/services/investment-error-action.test.ts` | Create | Corrective-route mapping tests. |
| `src/services/brickle.service.ts` | Modify | Make `commitFunds` throw preserved errors; remove legacy upload only after replacement. |
| `src/services/brickle.service.test.ts` | Create | Commit success/error preservation tests. |
| `src/components/leasing/leasingPurchase.ts` | Modify | Pre-permit local/eligibility gates and structured outcomes. |
| `src/components/leasing/leasingPurchase.test.ts` | Modify | Side-effect-order tests. |
| `src/hooks/leasing/useLeasingDetails.ts` | Modify | Stop collapsing purchase errors. |
| `src/components/leasing/LeasingResume.tsx` | Modify | Initialize/display/enforce asset minimum bricks. |
| `src/components/leasing/BricksPurchaseSlider.tsx` | Modify | Display COP and brick minimums. |
| `src/components/leasing/BuyAssetModal.tsx` | Modify | Show preserved API messages and structured outcomes. |
| `src/components/leasing/LeasingDetailScreen.tsx` | Modify | Navigate to reconsent/profile based on outcome. |
| `app/(stack)/leasing/index.tsx` | Modify | Supply corrective navigation callbacks. |

## Shared Contracts

All tasks use these exact names and property shapes:

```ts
export type RequiredLegalDocumentType =
  | "TermsAndConditions"
  | "PrivacyPolicy"
  | "ParticipationContract";

export type DocumentKind =
  | "IdentityFront"
  | "IdentityBack"
  | "Signature"
  | "LegacyIdentityDocument";

export type ProfileSubmissionStatus =
  | "UnderReview"
  | "Approved"
  | "Rejected";

export interface ApiErrorBody {
  code?: BrickleErrorCode;
  message?: string;
}
```

The plan assumes the additive authenticated-user response exposes:

```ts
export interface InvestmentEligibility {
  eligible: boolean;
  code:
    | "PROFILE_NOT_APPROVED"
    | "LEGAL_REACCEPTANCE_REQUIRED"
    | "LEGAL_VERSION_OUTDATED"
    | null;
  message: string | null;
}
```

If an older API response omits `investmentEligibility`, mobile does not infer legal currency from `termsAccepted`; it allows the authoritative investment request and maps any returned API `code`.

---

### Task 1: Typed Contracts and Stable API Errors

**Files:**
- Create: `src/types/legal-consent.types.ts`
- Modify: `src/types/user.types.ts:26-100`
- Create: `src/services/brickle-api-error.ts`
- Test: `src/services/brickle-api-error.test.ts`

**Interfaces:**
- Consumes: Axios failures with response body `{ code?: BrickleErrorCode; message?: string }`.
- Produces: `BrickleApiError`, `toBrickleApiError(error, fallbackMessage)`, all DTOs consumed by Tasks 2-9.

- [ ] **Step 1: Write the failing error-conversion test**

```ts
import { AxiosError } from "axios";
import { BrickleApiError, toBrickleApiError } from "./brickle-api-error";

describe("toBrickleApiError", () => {
  it("preserves response code, message, and status", () => {
    const error = new AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 409,
        statusText: "Conflict",
        headers: {},
        config: {} as never,
        data: {
          code: "IDEMPOTENCY_KEY_REUSED",
          message: "La clave ya fue usada con otro contenido.",
        },
      }
    );

    expect(toBrickleApiError(error, "Error inesperado")).toEqual(
      expect.objectContaining({
        name: "BrickleApiError",
        code: "IDEMPOTENCY_KEY_REUSED",
        message: "La clave ya fue usada con otro contenido.",
        status: 409,
      })
    );
  });

  it("uses a fallback without inventing a code", () => {
    const result = toBrickleApiError(new Error("offline"), "Sin conexión");
    expect(result).toBeInstanceOf(BrickleApiError);
    expect(result).toMatchObject({ code: null, message: "Sin conexión", status: null });
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx jest src/services/brickle-api-error.test.ts --runInBand`

Expected: FAIL with `Cannot find module './brickle-api-error'`.

- [ ] **Step 3: Add complete legal/profile DTOs**

```ts
// src/types/legal-consent.types.ts
import { DocumentTypeEnum } from "./user.types";

export type RequiredLegalDocumentType =
  | "TermsAndConditions"
  | "PrivacyPolicy"
  | "ParticipationContract";
export type DocumentKind =
  | "IdentityFront"
  | "IdentityBack"
  | "Signature"
  | "LegacyIdentityDocument";
export type ProfileSubmissionStatus = "UnderReview" | "Approved" | "Rejected";

export interface LegalDocumentVersionDto {
  id: string;
  documentType: RequiredLegalDocumentType;
  version: string;
  effectiveAtUtc: string;
  canonicalUrl: string;
  contentSha256: string;
  locale: string;
  jurisdiction: string;
}

export interface UserDocumentDto {
  id: string;
  userId: string;
  name: string;
  documentUrl?: string | null;
  documentKind: DocumentKind;
  profileSubmissionId: string | null;
}

export interface LegalAcceptanceRequest {
  documentVersionId: string;
  accepted: true;
}

export interface ProfileSubmissionRequest {
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    nationality: string;
    countryOfResidence: string;
    documentType: DocumentTypeEnum;
    documentNumber: string;
  };
  documents: {
    identityFrontId: string;
    identityBackId: string;
    signatureId: string;
  };
  legalAcceptances: LegalAcceptanceRequest[];
}

export interface ProfileSubmissionResponse {
  id: string;
  userId: string;
  revision: number;
  status: ProfileSubmissionStatus;
  submittedAtUtc: string;
}

export interface LegalReconsentRequest {
  signatureId: string;
  legalAcceptances: LegalAcceptanceRequest[];
}

export interface LegalReconsentResponse {
  consentPackageId: string;
  acceptedAtUtc: string;
}

export interface InvestmentEligibility {
  eligible: boolean;
  code:
    | "PROFILE_NOT_APPROVED"
    | "LEGAL_REACCEPTANCE_REQUIRED"
    | "LEGAL_VERSION_OUTDATED"
    | null;
  message: string | null;
}
```

- [ ] **Step 4: Implement the stable error type**

```ts
// src/services/brickle-api-error.ts
import { isAxiosError } from "axios";

export type BrickleErrorCode =
  | "INVESTMENT_BELOW_MINIMUM"
  | "INVESTMENT_AMOUNT_BRICKS_MISMATCH"
  | "INVALID_BRICKS_COUNT"
  | "PROFILE_NOT_APPROVED"
  | "LEGAL_REACCEPTANCE_REQUIRED"
  | "LEGAL_VERSION_OUTDATED"
  | "PROFILE_SUBMISSION_INCOMPLETE"
  | "DOCUMENT_KIND_MISMATCH"
  | "DOCUMENT_NOT_OWNED"
  | "STALE_PROFILE_SUBMISSION"
  | "IDEMPOTENCY_KEY_REUSED";

export class BrickleApiError extends Error {
  readonly name = "BrickleApiError";

  constructor(
    message: string,
    readonly code: BrickleErrorCode | null,
    readonly status: number | null
  ) {
    super(message);
  }
}

export function toBrickleApiError(
  error: unknown,
  fallbackMessage: string
): BrickleApiError {
  if (error instanceof BrickleApiError) return error;
  if (isAxiosError(error)) {
    const body = error.response?.data as
      | { code?: BrickleErrorCode; message?: string }
      | undefined;
    return new BrickleApiError(
      body?.message ?? fallbackMessage,
      body?.code ?? null,
      error.response?.status ?? null
    );
  }
  return new BrickleApiError(fallbackMessage, null, null);
}
```

- [ ] **Step 5: Extend user responses and exclude server-owned update fields**

Add `profileStatus?: ProfileSubmissionStatus` and `investmentEligibility?: InvestmentEligibility` to `BrickleUser` and `CreateBrickleUserResponse`. Replace the update type with:

```ts
type ServerOwnedUserField =
  | "termsAccepted"
  | "isBasicProfileComplete"
  | "isFullProfileComplete"
  | "isProfileUnderReview"
  | "profileStatus"
  | "investmentEligibility";

export type BrickleUserUpdateRequest = Partial<
  Omit<BrickleUser, ServerOwnedUserField | "dateOfBirth">
> & {
  dateOfBirth?: Date | string;
};
```

- [ ] **Step 6: Verify GREEN**

Run: `npx jest src/services/brickle-api-error.test.ts --runInBand && npx tsc --noEmit`

Expected: the test suite reports `PASS`; TypeScript exits `0`.

- [ ] **Step 7: Commit**

```bash
git add src/types/legal-consent.types.ts src/types/user.types.ts src/services/brickle-api-error.ts src/services/brickle-api-error.test.ts
git commit -m "Add typed profile consent API errors"
```

---

### Task 2: Active Legal Registry, Typed Upload, and Idempotent Submission Services

**Files:**
- Create: `src/services/profile-consent.service.ts`
- Test: `src/services/profile-consent.service.test.ts`
- Modify later, not in this task: `src/services/brickle.service.ts:293-339` after replacement callers pass.

**Interfaces:**
- Consumes: DTOs from Task 1 and existing `brickleClient`/`sanitizeUploadImage` conventions.
- Produces: `getActiveLegalDocuments()`, `uploadUserDocument(user, image, kind)`, `submitProfile(userId, request, idempotencyKey)`, and `submitLegalReconsent(userId, request, idempotencyKey)`.

- [ ] **Step 1: Write failing service contract tests**

```ts
import { brickleClient } from "@/src/lib/api/axios-brickle.client";
import {
  getActiveLegalDocuments,
  submitLegalReconsent,
  submitProfile,
  uploadUserDocument,
} from "./profile-consent.service";

jest.mock("@/src/lib/api/axios-brickle.client", () => ({
  brickleClient: { get: jest.fn(), post: jest.fn() },
}));

describe("profile-consent.service", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches active legal documents", async () => {
    jest.mocked(brickleClient.get).mockResolvedValueOnce({ data: [] });
    await getActiveLegalDocuments();
    expect(brickleClient.get).toHaveBeenCalledWith("/api/legal-documents/active");
  });

  it("uploads DocumentKind and returns the document ID", async () => {
    jest.mocked(brickleClient.post).mockResolvedValueOnce({
      data: {
        id: "00000000-0000-4000-8000-000000000001",
        userId: "user-1",
        name: "Identity Front",
        documentKind: "IdentityFront",
        profileSubmissionId: null,
      },
    });
    const result = await uploadUserDocument(
      { id: "user-1", email: "ada@example.com" },
      {
        uri: "file:///front.jpg",
        fileName: "front.jpg",
        mimeType: "image/jpeg",
        width: 800,
        height: 600,
      },
      "IdentityFront"
    );
    const body = jest.mocked(brickleClient.post).mock.calls[0][1] as FormData;
    expect(body.get("UserId")).toBe("user-1");
    expect(body.get("Name")).toBe("Identity Front");
    expect(body.get("DocumentKind")).toBe("IdentityFront");
    expect(result.id).toBe("00000000-0000-4000-8000-000000000001");
  });

  it("uses the exact profile endpoint and idempotency header", async () => {
    jest.mocked(brickleClient.post).mockResolvedValueOnce({
      data: { id: "submission-1", userId: "user-1", revision: 1, status: "UnderReview", submittedAtUtc: "2026-08-12T12:00:00Z" },
    });
    const request = {
      profile: { firstName: "Ada", lastName: "Lovelace", phoneNumber: "3001234567", dateOfBirth: "1990-01-01", nationality: "CO", countryOfResidence: "CO", documentType: 1, documentNumber: "123456789" },
      documents: { identityFrontId: "front-id", identityBackId: "back-id", signatureId: "signature-id" },
      legalAcceptances: ["terms-id", "privacy-id", "participation-id"].map((documentVersionId) => ({ documentVersionId, accepted: true as const })),
    };
    await submitProfile("user-1", request, "profile-key");
    expect(brickleClient.post).toHaveBeenCalledWith(
      "/api/User/user-1/profile-submissions",
      request,
      expect.objectContaining({ headers: expect.objectContaining({ "Idempotency-Key": "profile-key" }) })
    );
  });

  it("uses the exact reconsent endpoint without identity IDs", async () => {
    jest.mocked(brickleClient.post).mockResolvedValueOnce({ data: { consentPackageId: "package-1", acceptedAtUtc: "2026-08-12T12:00:00Z" } });
    const request = { signatureId: "signature-id", legalAcceptances: ["terms-id", "privacy-id", "participation-id"].map((documentVersionId) => ({ documentVersionId, accepted: true as const })) };
    await submitLegalReconsent("user-1", request, "reconsent-key");
    expect(brickleClient.post).toHaveBeenCalledWith(
      "/api/User/user-1/legal-acceptances",
      request,
      expect.objectContaining({ headers: expect.objectContaining({ "Idempotency-Key": "reconsent-key" }) })
    );
    expect(JSON.stringify(request)).not.toMatch(/identityFrontId|identityBackId/);
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npx jest src/services/profile-consent.service.test.ts --runInBand`

Expected: FAIL with `Cannot find module './profile-consent.service'`.

- [ ] **Step 3: Implement the complete service**

```ts
// src/services/profile-consent.service.ts
import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import { brickleClient } from "@/src/lib/api/axios-brickle.client";
import { PartialBrickleUser } from "@/src/types/user.types";
import {
  DocumentKind,
  LegalDocumentVersionDto,
  LegalReconsentRequest,
  LegalReconsentResponse,
  ProfileSubmissionRequest,
  ProfileSubmissionResponse,
  UserDocumentDto,
} from "@/src/types/legal-consent.types";
import { BRICKLE_SOURCE } from "@/src/utils/constants";
import { sanitizeUploadImage } from "@/src/utils/secureUpload";
import { toBrickleApiError } from "./brickle-api-error";

const DOCUMENT_NAMES = {
  IdentityFront: "Identity Front",
  IdentityBack: "Identity Back",
  Signature: "Signature",
} as const;

function headers(email = "") {
  return { correlationId: uuid.v4(), user: email, source: BRICKLE_SOURCE, RequestDate: new Date().toISOString() };
}

export async function getActiveLegalDocuments(): Promise<LegalDocumentVersionDto[]> {
  try {
    return (await brickleClient.get<LegalDocumentVersionDto[]>("/api/legal-documents/active")).data;
  } catch (error) {
    throw toBrickleApiError(error, "No se pudieron cargar los documentos legales.");
  }
}

export async function uploadUserDocument(
  user: Pick<PartialBrickleUser, "id" | "email">,
  image: ImagePicker.ImagePickerAsset,
  kind: Exclude<DocumentKind, "LegacyIdentityDocument">
): Promise<UserDocumentDto> {
  if (!user.id) throw new Error("No hay un usuario autenticado.");
  const body = new FormData();
  body.append("UserId", user.id);
  body.append("Name", DOCUMENT_NAMES[kind]);
  body.append("DocumentKind", kind);
  body.append("File", sanitizeUploadImage(image, `User.${kind}`) as never);
  try {
    const response = await brickleClient.post<UserDocumentDto>("/api/User/documents", body, { headers: headers(user.email) });
    if (!response.data.id) throw new Error("La API no devolvió el ID del documento.");
    return response.data;
  } catch (error) {
    throw toBrickleApiError(error, "No se pudo subir el documento.");
  }
}

export async function submitProfile(userId: string, request: ProfileSubmissionRequest, idempotencyKey: string): Promise<ProfileSubmissionResponse> {
  try {
    return (await brickleClient.post<ProfileSubmissionResponse>(`/api/User/${userId}/profile-submissions`, request, { headers: { ...headers(), "Idempotency-Key": idempotencyKey } })).data;
  } catch (error) {
    throw toBrickleApiError(error, "No se pudo enviar el perfil.");
  }
}

export async function submitLegalReconsent(userId: string, request: LegalReconsentRequest, idempotencyKey: string): Promise<LegalReconsentResponse> {
  try {
    return (await brickleClient.post<LegalReconsentResponse>(`/api/User/${userId}/legal-acceptances`, request, { headers: { ...headers(), "Idempotency-Key": idempotencyKey } })).data;
  } catch (error) {
    throw toBrickleApiError(error, "No se pudo registrar la aceptación legal.");
  }
}
```

- [ ] **Step 4: Verify GREEN**

Run: `npx jest src/services/profile-consent.service.test.ts --runInBand && npx tsc --noEmit`

Expected: suite PASS; TypeScript exits `0`. The existing `uploadIdentityDocument` remains untouched for now.

- [ ] **Step 5: Commit**

```bash
git add src/services/profile-consent.service.ts src/services/profile-consent.service.test.ts
git commit -m "Add staged profile consent services"
```

---

### Task 3: Six-Step Aggregate Validation and Payload

**Files:**
- Modify: `src/schemes/complete-profile-scheme.ts`
- Test: `src/schemes/complete-profile-scheme.test.ts`
- Modify: `src/hooks/auth/completeProfileSteps.ts`
- Test: `src/hooks/auth/completeProfileSteps.test.ts`
- Modify: `src/hooks/auth/completeProfileSubmission.ts`
- Test: `src/hooks/auth/completeProfileSubmission.test.ts`

**Interfaces:**
- Consumes: existing personal/identification fields and Task 1 DTOs.
- Produces: `CompleteProfileWizardData`, six step IDs, and `buildProfileSubmission(data): ProfileSubmissionRequest`.

- [ ] **Step 1: Write failing completeness and order tests**

```ts
// src/schemes/complete-profile-scheme.test.ts
import { DocumentTypeEnum } from "@/src/types/user.types";
import { completeProfileWizardSchema } from "./complete-profile-scheme";

const valid = {
  firstName: "Ada", lastName: "Lovelace", phoneNumber: "3001234567", birthDate: "18/06/1990",
  nationality: "CO", residenceCountry: "CO", documentType: DocumentTypeEnum.CC, documentNumber: "123456789",
  identityFrontId: "00000000-0000-4000-8000-000000000001",
  identityBackId: "00000000-0000-4000-8000-000000000002",
  signatureId: "00000000-0000-4000-8000-000000000003",
  acceptedDocumentVersionIds: [
    "00000000-0000-4000-8000-000000000004",
    "00000000-0000-4000-8000-000000000005",
    "00000000-0000-4000-8000-000000000006",
  ],
};

describe("completeProfileWizardSchema", () => {
  it.each(["identityFrontId", "identityBackId", "signatureId"] as const)("rejects missing %s", (field) => {
    expect(completeProfileWizardSchema.safeParse({ ...valid, [field]: "" }).success).toBe(false);
  });
  it("rejects any missing legal acceptance", () => {
    expect(completeProfileWizardSchema.safeParse({ ...valid, acceptedDocumentVersionIds: valid.acceptedDocumentVersionIds.slice(0, 2) }).success).toBe(false);
  });
  it("accepts the complete package", () => expect(completeProfileWizardSchema.safeParse(valid).success).toBe(true));
});
```

```ts
// src/hooks/auth/completeProfileSteps.test.ts
import { completeProfileSteps } from "./completeProfileSteps";

it("orders personal, identification, evidence, legal, signature, and summary", () => {
  expect(completeProfileSteps.map(({ id }) => id)).toEqual([
    "personal", "identification", "evidence", "legal", "signature", "summary",
  ]);
});
```

- [ ] **Step 2: Verify RED**

Run: `npx jest src/schemes/complete-profile-scheme.test.ts src/hooks/auth/completeProfileSteps.test.ts --runInBand`

Expected: FAIL because `completeProfileWizardSchema` is absent and the current wizard has two numeric steps.

- [ ] **Step 3: Add aggregate schemas and six exact steps**

Append to `complete-profile-scheme.ts`:

```ts
export const evidenceSchema = z.object({
  identityFrontId: z.string().uuid("Debes subir el frente del documento"),
  identityBackId: z.string().uuid("Debes subir el reverso del documento"),
});
export const legalSchema = z.object({
  acceptedDocumentVersionIds: z.array(z.string().uuid()).length(3, "Debes aceptar los tres documentos legales").refine((ids) => new Set(ids).size === 3, "Las aceptaciones deben ser distintas"),
});
export const signatureSchema = z.object({ signatureId: z.string().uuid("Debes registrar tu firma") });
export const completeProfileWizardSchema = step1Schema.merge(step2Schema).merge(evidenceSchema).merge(legalSchema).merge(signatureSchema);
export type CompleteProfileWizardData = z.infer<typeof completeProfileWizardSchema>;
export type StepSchema = typeof step1Schema | typeof step2Schema | typeof evidenceSchema | typeof legalSchema | typeof signatureSchema | typeof completeProfileWizardSchema;
```

Replace `completeProfileSteps` with:

```ts
export const completeProfileSteps = [
  { id: "personal", title: "Datos personales", fields: ["firstName", "lastName", "phoneNumber", "birthDate"], schema: step1Schema },
  { id: "identification", title: "Identificación", fields: ["nationality", "residenceCountry", "documentType", "documentNumber"], schema: step2Schema },
  { id: "evidence", title: "Documento", fields: ["identityFrontId", "identityBackId"], schema: evidenceSchema },
  { id: "legal", title: "Documentos legales", fields: ["acceptedDocumentVersionIds"], schema: legalSchema },
  { id: "signature", title: "Firma", fields: ["signatureId"], schema: signatureSchema },
  { id: "summary", title: "Resumen", fields: [], schema: completeProfileWizardSchema },
] as const;
```

- [ ] **Step 4: Write the failing exact-payload test**

```ts
import { DocumentTypeEnum } from "@/src/types/user.types";
import { buildProfileSubmission } from "./completeProfileSubmission";

it("builds one aggregate without server-owned flags", () => {
  const payload = buildProfileSubmission({
    firstName: " Ada ", lastName: " Lovelace ", phoneNumber: " 3001234567 ", birthDate: "18/06/1990",
    nationality: "CO", residenceCountry: "CO", documentType: DocumentTypeEnum.CC, documentNumber: "123456789",
    identityFrontId: "front-id", identityBackId: "back-id", signatureId: "signature-id",
    acceptedDocumentVersionIds: ["terms-id", "privacy-id", "participation-id"],
  });
  expect(payload).toEqual({
    profile: { firstName: "Ada", lastName: "Lovelace", phoneNumber: "3001234567", dateOfBirth: "1990-06-18", nationality: "CO", countryOfResidence: "CO", documentType: 1, documentNumber: "123456789" },
    documents: { identityFrontId: "front-id", identityBackId: "back-id", signatureId: "signature-id" },
    legalAcceptances: ["terms-id", "privacy-id", "participation-id"].map((documentVersionId) => ({ documentVersionId, accepted: true })),
  });
  expect(JSON.stringify(payload)).not.toMatch(/termsAccepted|isBasicProfileComplete|isFullProfileComplete|isProfileUnderReview/);
});
```

- [ ] **Step 5: Verify payload test RED**

Run: `npx jest src/hooks/auth/completeProfileSubmission.test.ts --runInBand`

Expected: FAIL because the existing builder returns a `PUT /api/User` shape and fabricated flags.

- [ ] **Step 6: Replace the builder**

```ts
import { CompleteProfileWizardData } from "@/src/schemes/complete-profile-scheme";
import { ProfileSubmissionRequest } from "@/src/types/legal-consent.types";
import { parseDateToISO } from "@/src/utils/date.utility";

export function buildProfileSubmission(data: CompleteProfileWizardData): ProfileSubmissionRequest {
  return {
    profile: {
      firstName: data.firstName.trim(), lastName: data.lastName.trim(), phoneNumber: data.phoneNumber.trim(),
      dateOfBirth: parseDateToISO(data.birthDate), nationality: data.nationality, countryOfResidence: data.residenceCountry,
      documentType: data.documentType, documentNumber: data.documentNumber.trim(),
    },
    documents: { identityFrontId: data.identityFrontId, identityBackId: data.identityBackId, signatureId: data.signatureId },
    legalAcceptances: data.acceptedDocumentVersionIds.map((documentVersionId) => ({ documentVersionId, accepted: true as const })),
  };
}
```

- [ ] **Step 7: Verify GREEN**

Run: `npx jest src/schemes/complete-profile-scheme.test.ts src/hooks/auth/completeProfileSteps.test.ts src/hooks/auth/completeProfileSubmission.test.ts --runInBand`

Expected: all three suites PASS.

- [ ] **Step 8: Commit**

```bash
git add src/schemes/complete-profile-scheme.ts src/schemes/complete-profile-scheme.test.ts src/hooks/auth/completeProfileSteps.ts src/hooks/auth/completeProfileSteps.test.ts src/hooks/auth/completeProfileSubmission.ts src/hooks/auth/completeProfileSubmission.test.ts
git commit -m "Define complete profile aggregate wizard"
```

---

### Task 4: Complete-Profile Evidence, Legal, Firma, and Summary UI

**Files:**
- Modify: `package.json`
- Modify: `bun.lock`
- Create: `src/components/auth/completeProfileForm/ProfileEvidenceStep.tsx`
- Create: `src/components/auth/completeProfileForm/ProfileSummaryStep.tsx`
- Create: `src/components/legal/LegalAcceptanceList.tsx`
- Create: `src/components/legal/SignaturePad.tsx`
- Modify: `src/hooks/auth/useCompleteProfileForm.ts`
- Modify: `src/components/auth/completeProfileForm/CompleteProfileForm.tsx`

**Interfaces:**
- Consumes: Tasks 1-3 contracts/services and existing `refreshAuthenticatedUser`.
- Produces: a usable six-step replacement while the legacy modal remains available to its existing callers.

- [ ] **Step 1: Install deterministic signature PNG capture**

Run: `npx expo install react-native-view-shot`

Expected: Expo reports an SDK-compatible `react-native-view-shot` installation and updates only `package.json`/`bun.lock`.

- [ ] **Step 2: Implement the signature component with this complete public interface**

```tsx
export interface SignaturePadHandle {
  capture: () => Promise<ImagePicker.ImagePickerAsset>;
  clear: () => void;
  hasSignature: () => boolean;
}
```

Use `PanResponder`, `Svg`, and `Path`; store each stroke as an SVG path. `capture()` must throw `Debes dibujar tu firma antes de continuar.` when empty, otherwise call:

```ts
const uri = await captureRef(captureTarget, { format: "png", quality: 0.9, result: "tmpfile" });
return { uri, fileName: "signature.png", mimeType: "image/png", width: 1000, height: 360 };
```

Render the capture target with `collapsable={false}`, a white background, and a `Pressable` labelled `Limpiar firma` that clears all strokes.

- [ ] **Step 3: Implement API-backed legal controls**

`LegalAcceptanceList` receives and emits exactly:

```ts
interface LegalAcceptanceListProps {
  documents: LegalDocumentVersionDto[];
  acceptedDocumentVersionIds: string[];
  onChange: (ids: string[]) => void;
  onOpenDocument: (document: LegalDocumentVersionDto) => void;
  disabled?: boolean;
}
```

Render the API order. Each row displays the Spanish type label, `Versión ${document.version}`, effective date, one link opening `document.canonicalUrl`, and one independent `Pressable` checkbox. Opening a link must not call `onChange`.

- [ ] **Step 4: Implement independent front/back uploads**

`ProfileEvidenceStep` receives:

```ts
interface ProfileEvidenceStepProps {
  identityFrontId: string;
  identityBackId: string;
  onUploaded: (kind: "IdentityFront" | "IdentityBack", documentId: string) => void;
}
```

For each side, request media-library permission, call `launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 0.8 })`, upload through `uploadUserDocument(user, image, kind)`, and pass `response.id`. Maintain separate loading/errors so a failed back upload never clears a successful front ID.

- [ ] **Step 5: Replace hook orchestration without removing the legacy modal**

Initialize complete state and one stable key:

```ts
const [formData, setFormData] = useState<CompleteProfileWizardData>({
  firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", phoneNumber: user?.phoneNumber ?? "", birthDate: "",
  nationality: "", residenceCountry: "CO", documentType: DocumentTypeEnum.CC, documentNumber: "",
  identityFrontId: "", identityBackId: "", signatureId: "", acceptedDocumentVersionIds: [],
});
const idempotencyKeyRef = useRef(uuid.v4() as string);
```

Fetch active documents and require one of each exact type:

```ts
const required = new Set(["TermsAndConditions", "PrivacyPolicy", "ParticipationContract"]);
const documents = await getActiveLegalDocuments();
if (documents.length !== 3 || documents.some(({ documentType }) => !required.has(documentType))) {
  throw new Error("La API no devolvió los tres documentos legales requeridos.");
}
setLegalDocuments(documents);
```

On final submission:

```ts
await submitProfile(user.id, buildProfileSubmission(formData), idempotencyKeyRef.current);
await refreshAuthenticatedUser({ email: user.email, getUserByEmail: BrickleService.getUserByEmail, setUser });
idempotencyKeyRef.current = uuid.v4() as string;
router.replace("/(stack)/(tabs)/dashboard");
```

On failure, preserve the key and set `submitError` from `BrickleApiError.message`. Do not call `updateUser` or mutate local profile flags.

- [ ] **Step 6: Render the six exact stages**

`CompleteProfileForm.tsx` maps step IDs as follows:

```tsx
switch (currentStep.id) {
  case "personal": return <PersonalFields />;
  case "identification": return <IdentificationFields />;
  case "evidence": return <ProfileEvidenceStep identityFrontId={formData.identityFrontId} identityBackId={formData.identityBackId} onUploaded={handleEvidenceUploaded} />;
  case "legal": return <LegalAcceptanceList documents={legalDocuments} acceptedDocumentVersionIds={formData.acceptedDocumentVersionIds} onChange={handleLegalChange} onOpenDocument={openLegalDocument} />;
  case "signature": return <SignaturePad ref={signaturePadRef} />;
  case "summary": return <ProfileSummaryStep data={formData} documents={legalDocuments} />;
}
```

Use existing actual input components for `PersonalFields`/`IdentificationFields`, not new wrapper components. On signature Continue, call `capture()`, upload with `DocumentKind="Signature"`, retain the returned ID, then advance. The summary button is `Enviar perfil`; all other forward buttons are `Continuar`.

- [ ] **Step 7: Verify replacement before any deletion**

Run: `npx jest src/services/profile-consent.service.test.ts src/schemes/complete-profile-scheme.test.ts src/hooks/auth/completeProfileSteps.test.ts src/hooks/auth/completeProfileSubmission.test.ts --runInBand && npx tsc --noEmit && npm run lint`

Expected: all focused suites PASS; TypeScript and lint exit `0`. `ProfileCompletionModal.tsx` still exists at this checkpoint.

- [ ] **Step 8: Commit**

```bash
git add package.json bun.lock src/components/auth/completeProfileForm src/components/legal src/hooks/auth/useCompleteProfileForm.ts
git commit -m "Build complete profile evidence wizard"
```

---

### Task 5: Switch Callers, Then Remove the Legacy One-Document Flow

**Files:**
- Modify: `src/hooks/dashboard/dashboardProfileAction.ts`
- Test: `src/hooks/dashboard/dashboardProfileAction.test.ts`
- Modify: `app/(stack)/(tabs)/dashboard/index.tsx`
- Modify: `app/(stack)/(tabs)/wallet/index.tsx`
- Modify: `src/components/dashboard/ProfileDocumentCta.tsx`
- Modify: `src/services/brickle.service.ts:293-339`
- Delete last: `src/components/ui/modal/ProfileCompletionModal.tsx`

**Interfaces:**
- Consumes: tested replacement route `/(stack)/(auth)/complete-profile` from Task 4.
- Produces: `DashboardProfileAction = "discover" | "review" | "complete-profile"`; no remaining URL-only upload caller or client-owned review mutation.

- [ ] **Step 1: Write failing unified-routing tests**

```ts
import { getDashboardProfileAction } from "./dashboardProfileAction";

describe("getDashboardProfileAction", () => {
  it("uses the unified wizard when evidence is incomplete", () => {
    expect(getDashboardProfileAction({ isBasicProfileComplete: true, isFullProfileComplete: false, isProfileUnderReview: false })).toBe("complete-profile");
  });
  it("shows review only from API state", () => {
    expect(getDashboardProfileAction({ isFullProfileComplete: false, isProfileUnderReview: true })).toBe("review");
  });
  it("allows approved users to discover", () => {
    expect(getDashboardProfileAction({ isFullProfileComplete: true, isProfileUnderReview: false })).toBe("discover");
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npx jest src/hooks/dashboard/dashboardProfileAction.test.ts --runInBand`

Expected: first test FAILS with received `upload-document`.

- [ ] **Step 3: Implement unified action**

```ts
export type DashboardProfileAction = "discover" | "review" | "complete-profile";
export function getDashboardProfileAction(user?: DashboardProfileUser | null): DashboardProfileAction {
  if (user?.isFullProfileComplete) return "discover";
  if (user?.isProfileUnderReview) return "review";
  return "complete-profile";
}
```

- [ ] **Step 4: Switch dashboard and wallet callers**

Remove `openDocumentUpload`, modal state, and `ProfileCompletionModal` rendering. Every incomplete-profile action must execute:

```ts
router.push("/(stack)/(auth)/complete-profile");
```

Change CTA copy to `Completa tus datos, documento, aceptaciones legales y firma para enviar tu perfil a revisión.`

- [ ] **Step 5: Verify no caller remains, then remove the old implementation**

Run: `rg "ProfileCompletionModal|uploadIdentityDocument" app src`

Expected before deletion: only `src/components/ui/modal/ProfileCompletionModal.tsx` and `src/services/brickle.service.ts` match. Delete the modal file and delete `uploadIdentityDocument` from `brickle.service.ts`; rerun the same command and expect no matches.

- [ ] **Step 6: Verify GREEN and forbidden writes**

Run: `npx jest src/hooks/dashboard/dashboardProfileAction.test.ts --runInBand && npx tsc --noEmit && rg "termsAccepted:\s*true|isProfileUnderReview:\s*true" src/hooks/auth src/components/auth app`

Expected: Jest PASS, TypeScript exits `0`, and `rg` returns no matches.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/dashboard/dashboardProfileAction.ts src/hooks/dashboard/dashboardProfileAction.test.ts app/\(stack\)/\(tabs\)/dashboard/index.tsx app/\(stack\)/\(tabs\)/wallet/index.tsx src/components/dashboard/ProfileDocumentCta.tsx src/components/ui/modal/ProfileCompletionModal.tsx src/services/brickle.service.ts
git commit -m "Replace legacy profile document transition"
```

---

### Task 6: Investment-Time Reconsent and API-Driven Legal Library

**Files:**
- Create: `src/hooks/legal/legalReconsentSubmission.ts`
- Test: `src/hooks/legal/legalReconsentSubmission.test.ts`
- Create: `src/hooks/legal/useLegalReconsent.ts`
- Create: `src/components/legal/LegalReconsentScreen.tsx`
- Create: `app/(stack)/legal-reconsent.tsx`
- Modify: `app/(stack)/_layout.tsx:29-39`
- Modify: `src/constants/legal-documents.ts`
- Modify: `app/(stack)/(tabs)/profile/legal-documents/index.tsx`

**Interfaces:**
- Consumes: Task 2 active legal/upload/reconsent services and Task 4 legal/signature controls.
- Produces: `buildLegalReconsent(signatureId, acceptedVersionIds)` and route `/(stack)/legal-reconsent`.

- [ ] **Step 1: Write failing reconsent package tests**

```ts
import { buildLegalReconsent } from "./legalReconsentSubmission";

describe("buildLegalReconsent", () => {
  it("contains one signature and exactly three explicit acceptances", () => {
    expect(buildLegalReconsent("signature-id", ["terms-id", "privacy-id", "participation-id"])).toEqual({
      signatureId: "signature-id",
      legalAcceptances: ["terms-id", "privacy-id", "participation-id"].map((documentVersionId) => ({ documentVersionId, accepted: true })),
    });
  });
  it("rejects an incomplete package", () => {
    expect(() => buildLegalReconsent("signature-id", ["terms-id", "privacy-id"])).toThrow("Debes aceptar los tres documentos legales.");
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npx jest src/hooks/legal/legalReconsentSubmission.test.ts --runInBand`

Expected: FAIL with missing module.

- [ ] **Step 3: Implement the request builder**

```ts
import { LegalReconsentRequest } from "@/src/types/legal-consent.types";
export function buildLegalReconsent(signatureId: string, acceptedVersionIds: string[]): LegalReconsentRequest {
  if (!signatureId) throw new Error("Debes registrar tu firma.");
  if (acceptedVersionIds.length !== 3 || new Set(acceptedVersionIds).size !== 3) throw new Error("Debes aceptar los tres documentos legales.");
  return { signatureId, legalAcceptances: acceptedVersionIds.map((documentVersionId) => ({ documentVersionId, accepted: true as const })) };
}
```

- [ ] **Step 4: Implement stable-key reconsent orchestration**

`useLegalReconsent` fetches and validates exactly three active types, retains `const idempotencyKeyRef = useRef(uuid.v4() as string)`, captures/uploads a new `Signature`, calls `submitLegalReconsent(user.id, buildLegalReconsent(signatureId, acceptedIds), idempotencyKeyRef.current)`, refreshes the user, replaces the key only after success, and calls `router.back()`. Failure sets the preserved message and keeps IDs/key for retry. It contains no identity upload state or methods.

- [ ] **Step 5: Implement and register the screen**

Render `LegalAcceptanceList`, `SignaturePad`, error text, and a disabled-until-complete `Aceptar y continuar` button beneath: `Para continuar con tu inversión debes aceptar las versiones legales vigentes y registrar una nueva firma.` Register:

```tsx
<Stack.Screen name="legal-reconsent" options={{ headerShown: false, gestureEnabled: false }} />
```

- [ ] **Step 6: Replace hardcoded legal URLs only after API-backed controls exist**

Replace `src/constants/legal-documents.ts` with:

```ts
import { RequiredLegalDocumentType } from "@/src/types/legal-consent.types";
export const LEGAL_DOCUMENT_LABELS: Record<RequiredLegalDocumentType, string> = {
  TermsAndConditions: "Términos y condiciones",
  PrivacyPolicy: "Política de privacidad",
  ParticipationContract: "Contrato de participación",
};
```

Update the profile legal screen to fetch `getActiveLegalDocuments()`, render all three labels/versions/effective dates, and pass only `canonicalUrl` to existing in-app/external open functions. Render loading, preserved error text, and a `Reintentar` `Pressable`.

- [ ] **Step 7: Verify GREEN and URL removal**

Run: `npx jest src/hooks/legal/legalReconsentSubmission.test.ts --runInBand && npx tsc --noEmit && npm run lint && rg "BRICKLE_SAS_Terminos|BRICKLE_SAS_Politica|BRICKLE_TERMS_AND_CONDITIONS_PDF_URL|BRICKLE_PRIVACY_POLICY_PDF_URL" app src`

Expected: tests/typecheck/lint PASS; `rg` returns no hardcoded official URL constants.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/legal src/components/legal/LegalReconsentScreen.tsx app/\(stack\)/legal-reconsent.tsx app/\(stack\)/_layout.tsx src/constants/legal-documents.ts app/\(stack\)/\(tabs\)/profile/legal-documents/index.tsx
git commit -m "Add current legal reconsent flow"
```

---

### Task 7: COP 1,000,000 and Asset-Specific Minimum Bricks

**Files:**
- Create: `src/constants/investment-policy.ts`
- Create: `src/utils/investment-policy.ts`
- Test: `src/utils/investment-policy.test.ts`
- Modify: `src/components/leasing/LeasingResume.tsx`
- Modify: `src/components/leasing/BricksPurchaseSlider.tsx`

**Interfaces:**
- Produces: `MINIMUM_INVESTMENT_COP`, `getMinimumBricks(pricePerToken)`, and `validateInvestmentSelection(bricks, pricePerToken, availableBricks)`.

- [ ] **Step 1: Write failing arithmetic tests**

```ts
import { getMinimumBricks, validateInvestmentSelection } from "./investment-policy";

describe("getMinimumBricks", () => {
  it.each([[1_000_000, 1], [600_000, 2], [333_333, 4], [250_000, 4]])("ceil-divides COP 1M by %i", (price, expected) => expect(getMinimumBricks(price)).toBe(expected));
  it("rejects a nonpositive price", () => expect(() => getMinimumBricks(0)).toThrow("El precio por brick debe ser positivo."));
});

describe("validateInvestmentSelection", () => {
  it("rejects fractional bricks", () => expect(validateInvestmentSelection(1.5, 1_000_000, 10)).toMatchObject({ valid: false, code: "INVALID_BRICKS_COUNT" }));
  it("rejects COP 999,999", () => expect(validateInvestmentSelection(1, 999_999, 10)).toMatchObject({ valid: false, code: "INVESTMENT_BELOW_MINIMUM" }));
  it("accepts COP 1,000,000", () => expect(validateInvestmentSelection(1, 1_000_000, 10)).toEqual({ valid: true, amount: 1_000_000, minimumBricks: 1 }));
  it("rejects insufficient inventory", () => expect(validateInvestmentSelection(4, 250_000, 3)).toMatchObject({ valid: false, code: "INSUFFICIENT_INVENTORY" }));
});
```

- [ ] **Step 2: Verify RED**

Run: `npx jest src/utils/investment-policy.test.ts --runInBand`

Expected: FAIL with missing module.

- [ ] **Step 3: Implement minimum policy**

```ts
// src/constants/investment-policy.ts
export const MINIMUM_INVESTMENT_COP = 1_000_000;
```

```ts
// src/utils/investment-policy.ts
import { MINIMUM_INVESTMENT_COP } from "@/src/constants/investment-policy";
export function getMinimumBricks(pricePerToken: number): number {
  if (!Number.isFinite(pricePerToken) || pricePerToken <= 0) throw new Error("El precio por brick debe ser positivo.");
  return Math.ceil(MINIMUM_INVESTMENT_COP / pricePerToken);
}
export function validateInvestmentSelection(bricks: number, pricePerToken: number, availableBricks: number) {
  if (!Number.isInteger(bricks) || bricks <= 0) return { valid: false as const, code: "INVALID_BRICKS_COUNT" as const, message: "El número de bricks debe ser un entero positivo." };
  const minimumBricks = getMinimumBricks(pricePerToken);
  const amount = bricks * pricePerToken;
  if (amount < MINIMUM_INVESTMENT_COP) return { valid: false as const, code: "INVESTMENT_BELOW_MINIMUM" as const, message: "La inversión mínima es de $1.000.000 COP." };
  if (bricks > availableBricks) return { valid: false as const, code: "INSUFFICIENT_INVENTORY" as const, message: "No hay suficientes bricks disponibles." };
  return { valid: true as const, amount, minimumBricks };
}
```

- [ ] **Step 4: Apply policy to purchase controls**

In `LeasingResume`, initialize `bricksCount` to `minimumBricks` when inventory permits, never decrement below it, and disable when `validateInvestmentSelection` is invalid. Display `Inversión mínima: $1.000.000 COP` and `Mínimo para este activo: ${minimumBricks} bricks`. If inventory is lower, display `No hay suficientes bricks para alcanzar la inversión mínima` and keep purchase disabled.

In `BricksPurchaseSlider`, add:

```tsx
<Text className="mt-3 text-xs font-libre-regular text-secondary">
  Inversión mínima: {formatCurrency(MINIMUM_INVESTMENT_COP)} COP · {getMinimumBricks(pricePerToken)} bricks para este activo
</Text>
```

- [ ] **Step 5: Verify GREEN**

Run: `npx jest src/utils/investment-policy.test.ts --runInBand && npx tsc --noEmit`

Expected: tests PASS and TypeScript exits `0`.

- [ ] **Step 6: Commit**

```bash
git add src/constants/investment-policy.ts src/utils/investment-policy.ts src/utils/investment-policy.test.ts src/components/leasing/LeasingResume.tsx src/components/leasing/BricksPurchaseSlider.tsx
git commit -m "Enforce COP one million investment minimum"
```

---

### Task 8: Preserve Investment Error Codes and Route Corrective Actions

**Files:**
- Create: `src/services/investment-error-action.ts`
- Test: `src/services/investment-error-action.test.ts`
- Modify: `src/services/brickle.service.ts:470-494`
- Test: `src/services/brickle.service.test.ts`
- Modify: `src/components/leasing/leasingPurchase.ts`
- Test: `src/components/leasing/leasingPurchase.test.ts`
- Modify: `src/hooks/leasing/useLeasingDetails.ts:29-69`
- Modify: `src/components/leasing/BuyAssetModal.tsx`
- Modify: `src/components/leasing/LeasingDetailScreen.tsx`
- Modify: `app/(stack)/leasing/index.tsx`

**Interfaces:**
- Consumes: `BrickleApiError`, investment policy, and optional `user.investmentEligibility`.
- Produces: `InvestmentErrorAction`, `PurchaseOutcome`, and pre-permit ordering guarantees.

- [ ] **Step 1: Write failing code-routing tests**

```ts
import { getInvestmentErrorAction } from "./investment-error-action";
describe("getInvestmentErrorAction", () => {
  it.each([
    ["LEGAL_REACCEPTANCE_REQUIRED", "legal-reconsent"], ["LEGAL_VERSION_OUTDATED", "legal-reconsent"],
    ["PROFILE_NOT_APPROVED", "complete-profile"], ["PROFILE_SUBMISSION_INCOMPLETE", "complete-profile"],
    ["INVESTMENT_BELOW_MINIMUM", "message"], ["INVESTMENT_AMOUNT_BRICKS_MISMATCH", "message"], ["INVALID_BRICKS_COUNT", "message"],
  ] as const)("maps %s to %s", (code, kind) => expect(getInvestmentErrorAction(code, "API message")).toEqual({ kind, message: "API message" }));
});
```

- [ ] **Step 2: Add failing commit preservation test**

```ts
import { brickleClient } from "@/src/lib/api/axios-brickle.client";
import { commitFunds } from "./brickle.service";
jest.mock("@/src/lib/api/axios-brickle.client", () => ({ brickleClient: { post: jest.fn() } }));
it("throws API code instead of returning false", async () => {
  jest.mocked(brickleClient.post).mockRejectedValueOnce({ isAxiosError: true, response: { status: 403, data: { code: "LEGAL_REACCEPTANCE_REQUIRED", message: "Debes aceptar las versiones vigentes." } } });
  await expect(commitFunds("asset-1", "ada@example.com", { token: "0xtoken", sender: "0xsender", amount: 1_000_000, deadline: 123, totalTokens: 4, permitSignature: { v: 27, r: "0xr", s: "0xs" } })).rejects.toMatchObject({ code: "LEGAL_REACCEPTANCE_REQUIRED", message: "Debes aceptar las versiones vigentes.", status: 403 });
});
```

- [ ] **Step 3: Add failing pre-side-effect purchase tests**

```ts
it("rejects below minimum before wallet readiness", async () => {
  const handleBuyAsset = jest.fn();
  const result = await purchaseLeasingAsset({ user: { email: "ada@example.com", walletAddress: "0xabc", investmentEligibility: { eligible: true, code: null, message: null } }, tokens: 1, availableTokens: 10, pricePerToken: 999_999, handleBuyAsset, onMissingPrivateKey: jest.fn(), onWalletUpgradeRequired: jest.fn() });
  expect(result).toMatchObject({ status: "error", code: "INVESTMENT_BELOW_MINIMUM" });
  expect(ensureWalletReadyForSigning).not.toHaveBeenCalled();
  expect(handleBuyAsset).not.toHaveBeenCalled();
});

it("routes legal reconsent before wallet readiness", async () => {
  const handleBuyAsset = jest.fn();
  const result = await purchaseLeasingAsset({ user: { email: "ada@example.com", walletAddress: "0xabc", investmentEligibility: { eligible: false, code: "LEGAL_REACCEPTANCE_REQUIRED", message: "Actualiza tus aceptaciones." } }, tokens: 1, availableTokens: 10, pricePerToken: 1_000_000, handleBuyAsset, onMissingPrivateKey: jest.fn(), onWalletUpgradeRequired: jest.fn() });
  expect(result).toEqual({ status: "corrective-action", action: "legal-reconsent", message: "Actualiza tus aceptaciones." });
  expect(ensureWalletReadyForSigning).not.toHaveBeenCalled();
  expect(handleBuyAsset).not.toHaveBeenCalled();
});
```

- [ ] **Step 4: Verify RED**

Run: `npx jest src/services/investment-error-action.test.ts src/services/brickle.service.test.ts src/components/leasing/leasingPurchase.test.ts --runInBand`

Expected: missing mapper, `commitFunds` resolves `false`, and purchase helper lacks minimum/eligibility behavior.

- [ ] **Step 5: Implement mapper and structured outcome**

```ts
// src/services/investment-error-action.ts
import { BrickleErrorCode } from "./brickle-api-error";
export type InvestmentErrorAction = { kind: "legal-reconsent" | "complete-profile" | "message"; message: string };
export function getInvestmentErrorAction(code: BrickleErrorCode | null, message: string): InvestmentErrorAction {
  if (code === "LEGAL_REACCEPTANCE_REQUIRED" || code === "LEGAL_VERSION_OUTDATED") return { kind: "legal-reconsent", message };
  if (code === "PROFILE_NOT_APPROVED" || code === "PROFILE_SUBMISSION_INCOMPLETE") return { kind: "complete-profile", message };
  return { kind: "message", message };
}
```

```ts
export type PurchaseOutcome =
  | { status: "success" }
  | { status: "error"; code: string | null; message: string }
  | { status: "corrective-action"; action: "legal-reconsent" | "complete-profile"; message: string };
```

- [ ] **Step 6: Make `commitFunds` throw preserved failures**

Replace its catch with:

```ts
} catch (error) {
  throw toBrickleApiError(error, "No se pudo procesar la inversión.");
}
```

- [ ] **Step 7: Enforce purchase ordering**

Add `availableTokens` to `PurchaseLeasingAssetParams`. Required function order: validate user identity fields; call `validateInvestmentSelection`; map projected ineligibility when present; call `ensureWalletReadyForSigning`; invoke `handleBuyAsset(email, walletAddress, tokens, validation.amount)`; catch `BrickleApiError` and map it through `getInvestmentErrorAction`. Never accept caller-provided amount and never call wallet/permit work for local or projected eligibility rejection.

- [ ] **Step 8: Preserve outcome through hook and UI**

Remove the catch in `useLeasingDetails.handleBuyAsset` that returns `{ success: false }`; let `BrickleApiError` reach `purchaseLeasingAsset`. Change `BuyAssetModal.onPurchase` to `() => Promise<PurchaseOutcome>` and display `outcome.message` for ordinary errors. For corrective actions, close the modal and let `LeasingDetailScreen` call either `onNavigateToLegalReconsent()` or `onNavigateToCompleteProfile()`.

Supply exact callbacks in `app/(stack)/leasing/index.tsx`:

```tsx
onNavigateToLegalReconsent={() => nav.push("/(stack)/legal-reconsent")}
onNavigateToCompleteProfile={() => nav.push("/(stack)/(auth)/complete-profile")}
```

- [ ] **Step 9: Verify GREEN**

Run: `npx jest src/services/investment-error-action.test.ts src/services/brickle.service.test.ts src/components/leasing/leasingPurchase.test.ts --runInBand && npx tsc --noEmit`

Expected: all suites PASS; tests prove rejection precedes wallet readiness and `handleBuyAsset`; TypeScript exits `0`.

- [ ] **Step 10: Commit**

```bash
git add src/services/investment-error-action.ts src/services/investment-error-action.test.ts src/services/brickle.service.ts src/services/brickle.service.test.ts src/components/leasing/leasingPurchase.ts src/components/leasing/leasingPurchase.test.ts src/hooks/leasing/useLeasingDetails.ts src/components/leasing/BuyAssetModal.tsx src/components/leasing/LeasingDetailScreen.tsx app/\(stack\)/leasing/index.tsx
git commit -m "Preserve investment errors and corrective routes"
```

---

### Task 9: Full Regression and Manual Acceptance

**Files:**
- Verify: all files in the File Map.
- Modify only when a failing test identifies a concrete defect; add the reproducing test before its fix.

**Interfaces:**
- Consumes: all prior task outputs.
- Produces: a release candidate satisfying every mobile requirement in the approved API spec.

- [ ] **Step 1: Run all feature suites**

Run:

```bash
npx jest src/services/brickle-api-error.test.ts src/services/profile-consent.service.test.ts src/schemes/complete-profile-scheme.test.ts src/hooks/auth/completeProfileSteps.test.ts src/hooks/auth/completeProfileSubmission.test.ts src/hooks/dashboard/dashboardProfileAction.test.ts src/hooks/legal/legalReconsentSubmission.test.ts src/utils/investment-policy.test.ts src/services/investment-error-action.test.ts src/services/brickle.service.test.ts src/components/leasing/leasingPurchase.test.ts --runInBand
```

Expected: every listed suite reports PASS; no unhandled rejection or console error caused by the tested paths.

- [ ] **Step 2: Run complete automated verification**

Run: `npx jest --runInBand && npx tsc --noEmit && npm run lint`

Expected: full Jest PASS; TypeScript and lint exit `0`.

- [ ] **Step 3: Scan contract-sensitive behavior**

Run:

```bash
rg "errorCode|termsAccepted:\s*true|isProfileUnderReview:\s*true|uploadIdentityDocument|return false" src/services src/hooks/auth src/components/auth src/components/leasing app
```

Expected: no `errorCode` use for this API contract, no fabricated legal/review flags, no legacy URL-only identity uploader, and no `commitFunds` failure collapsed to `false`. Unrelated existing `return false` statements must be inspected and retained only when they are not API error handling.

- [ ] **Step 4: Verify minimum arithmetic in a development build**

Run: `npx expo start`

Expected manual matrix:

| Price per brick | Minimum bricks | Lowest enabled amount |
|---:|---:|---:|
| COP 1,000,000 | 1 | COP 1,000,000 |
| COP 600,000 | 2 | COP 1,200,000 |
| COP 333,333 | 4 | COP 1,333,332 |
| COP 250,000 | 4 | COP 1,000,000 |

Also verify inventory below minimum disables purchase and no permit request begins below minimum.

- [ ] **Step 5: Verify complete-profile request behavior**

Use the API-enabled development environment and confirm network requests in order: three typed `POST /api/User/documents` calls for front/back/signature; one `POST /api/User/{userId}/profile-submissions`; no profile `PUT`. Confirm three distinct returned IDs and three active version IDs appear in the final JSON. Force one final-submission network failure, retry unchanged, and confirm the `Idempotency-Key` header is identical. Confirm success refreshes user state and response status is handled as `UnderReview` without a local flag write.

- [ ] **Step 6: Verify reconsent request behavior**

With an approved user whose eligibility code is `LEGAL_REACCEPTANCE_REQUIRED`, confirm ordinary navigation remains available; investment opens `/(stack)/legal-reconsent`; the screen has no identity controls; one signature upload and one `POST /api/User/{userId}/legal-acceptances` occur; a forced retry reuses its key; success refreshes eligibility and returns to the asset.

- [ ] **Step 7: Verify every corrective API code**

Confirm this exact behavior with mocked/development API responses:

| `code` | Mobile result |
|---|---|
| `LEGAL_REACCEPTANCE_REQUIRED` | Reconsent route. |
| `LEGAL_VERSION_OUTDATED` | Reconsent route with API message. |
| `PROFILE_NOT_APPROVED` | Complete-profile/review correction. |
| `PROFILE_SUBMISSION_INCOMPLETE` | Complete-profile route. |
| `INVESTMENT_BELOW_MINIMUM` | Purchase UI message. |
| `INVESTMENT_AMOUNT_BRICKS_MISMATCH` | Purchase UI message; refresh asset before retry. |
| `INVALID_BRICKS_COUNT` | Purchase UI message. |
| `DOCUMENT_KIND_MISMATCH` | Preserve wizard state and identify failed evidence submission. |
| `DOCUMENT_NOT_OWNED` | Preserve wizard state and require affected artifact re-upload. |
| `STALE_PROFILE_SUBMISSION` | Refresh authenticated profile before retry. |
| `IDEMPOTENCY_KEY_REUSED` | Show conflict and do not silently replace the key for changed content. |

- [ ] **Step 8: Inspect the intended diff**

Run: `git status --short && git diff --check && git diff --stat`

Expected: only File Map paths are changed; `git diff --check` is empty; no `.env`, `.expo`, native build outputs, or credentials are staged.

- [ ] **Step 9: Commit verification fixes only when present**

```bash
git add app src package.json bun.lock
git commit -m "Complete mobile profile consent rollout"
```

Expected: create this commit only if Step 1-8 required tested corrections; do not create an empty commit.

## Completion Criteria

- The wizard has personal, identification, front/back evidence, three legal acceptances, firma, and summary stages.
- Upload IDs are retained and submitted through the approved aggregate API.
- Profile and reconsent retries retain their idempotency keys.
- The replacement is tested before the old one-document path is deleted.
- No updated flow writes server-owned profile or legal flags.
- Existing approved users are interrupted for legal currency only at investment time.
- Legal links come only from the active registry and include the Participation Contract.
- Every asset displays COP 1,000,000 and `ceil(1_000_000 / pricePerToken)` minimum bricks.
- Local purchase validation runs before wallet and permit side effects.
- API failures retain `code`, message, and status through corrective navigation or purchase feedback.
- Focused Jest, full Jest, TypeScript, and ESLint all pass.
