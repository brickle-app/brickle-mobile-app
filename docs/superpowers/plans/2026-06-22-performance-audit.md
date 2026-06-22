# Performance Audit — Bloom Mobile App

> Date: 2026-06-22
> Scope: React Native app data fetching, rendering, and list performance

## Executive Summary

The app has several performance hotspots. The highest-impact issues are:
1. **SearchModal fetches 100 assets on every mount** even when closed (P0)
2. **Wallet duplicates investment fetch** via two separate `useDashboardInvestments()` calls (P0)
3. **Dashboard/portfolio load on-chain reads for every investment at once** without concurrency limits (P0)
4. **Discover renders fetched asset lists with `ScrollView + .map()`** instead of virtualized lists (P1)
5. **My-investments fetches the entire investments list** to filter for one asset (P1)

---

## P0 — Highest Impact (fix immediately)

### 1. SearchModal always fetches on mount

| File | Issue |
|------|-------|
| `src/components/ui/searchModal/SearchModal.tsx:27` | Calls `useSearchAssets(searchTerm)` always |
| `src/hooks/search/useSearchAssets.ts:99-103` | Effect fetches 100 assets on mount |

**Root cause:** `SearchModal` is always mounted in root layout. `useSearchAssets` fetches on mount regardless of modal visibility.

**Fix applied:** Added `enabled` flag to `useSearchAssets`. Only fetches when `isModalVisible` is true.

### 2. Wallet duplicates investment fetch

| File | Issue |
|------|-------|
| `app/(stack)/(tabs)/wallet/index.tsx:42` | `useDashboardInvestments()` for `refetchInvestments` |
| `src/components/wallet/PortfolioCompositionChart.tsx:18-19` | Calls `useDashboardInvestments()` again |

**Fix needed:** Pass investments from wallet screen into `PortfolioCompositionChart`, or centralize in Zustand.

### 3. On-chain reads unbounded per investment

| File | Issue |
|------|-------|
| `src/hooks/dashboard/useInvestmentsOnChainSnapshots.ts:26-33` | `Promise.all(investments.map(...loadInvestorOnChainSnapshot))` |
| `src/hooks/portfolio/useClaimableRentInvestments.ts:20-57` | Same pattern for claimable reads |

**Fix needed:** Add backend/batch RPC endpoint or multicall. Cache snapshots by `{wallet, contractAddress}`. Limit concurrency.

---

## P1 — High Impact (fix soon)

### 4. Discover ScrollView + .map (no virtualization)

| File | Issue |
|------|-------|
| `app/(stack)/(tabs)/discover/index.tsx:41` | ScrollView body |
| `src/components/discover/DiscoverAssetCardList.tsx:35` | `.map()` renders all assets |

**Fix needed:** Convert to `SectionList`/`FlatList` with categories as `ListHeaderComponent`. Add backend `page`/`limit`.

### 5. My-investments fetches entire list for one asset

| File | Issue |
|------|-------|
| `src/services/brickle.service.ts:205-211` | `getInvestmentForUserLeasing()` calls `getInvestmentsByUserId()` then filters |

**Fix needed:** Add backend endpoint `/api/Investment/user/{userId}/leasing/{leasingId}`.

### 6. Portfolio renders all investments eagerly

| File | Issue |
|------|-------|
| `app/(stack)/(tabs)/portfolio/index.tsx:189` | ScrollView with all categories |
| `src/components/portfolio/CategoryCollapsibleSection.tsx:135-144` | Maps all rows |

**Fix needed:** Use `SectionList`. Lazy-load category contents on expansion.

### 7. Dashboard refresh waterfall

| File | Issue |
|------|-------|
| `app/(stack)/(tabs)/dashboard/index.tsx:112-126` | `refetchInvestments()` and `refetchSnapshots()` in parallel but snapshots use stale investments |

**Fix needed:** Refresh investments first, then snapshots for the updated list.

### 8. Dashboard/discover duplicate grouped leasing fetch

| File | Issue |
|------|-------|
| `app/(stack)/(tabs)/dashboard/index.tsx:84-98` | `getInvestmentsGroupedByCategory(userEmail)` |
| `src/hooks/discover/useFetchTrendingAssets.tsx:23` | Same call |

**Fix needed:** Cache with stale time, or share through store/query key.

---

## P2 — Medium Impact (optimize later)

| Issue | File | Fix |
|-------|------|-----|
| Wallet movements fetch/filter all logs client-side | `src/components/wallet/forms/MovementsForm.tsx:70-78` | Add API pagination/search |
| My-investments rent history disabled FlatList in ScrollView | `app/(stack)/(tabs)/my-investments/index.tsx:488` | Single FlatList/SectionList |
| Asset detail amortization chart maps all periods | `src/components/leasing/AmortizationChart.tsx:43` | Cap/aggregate for long terms |
| Notifications list has no pagination | `app/(stack)/(tabs)/notifications/index.tsx:157-190` | Remove dead handler or implement |

---

## Applied Fixes (this session)

1. **SearchModal** no longer fetches while closed (`enabled` flag in `useSearchAssets`)
2. **Discovery filtered empty state** now shows selected category, contextual copy, and clear action

## Applied Fixes (this session)

1. **SearchModal** no longer fetches while closed (`enabled` flag in `useSearchAssets`)
2. **Discovery filtered empty state** now shows selected category, contextual copy, and clear action
3. **Portfolio screen** shows balance and chart immediately when `currentValue` is available from Zustand (no longer waits for full backend response)
4. **Portfolio refresh** parallelizes `refetchPortfolio()` and `refetchInvestments()` instead of sequential awaits

## Recommended Next Steps

1. Centralize investment data in Zustand store (shared between dashboard, wallet, portfolio)
2. Add backend `/api/Investment/user/{userId}/leasing/{leasingId}` endpoint
3. Convert Discover body to `SectionList`
4. Add concurrency limit + cache to on-chain snapshot reads
5. Cache `getInvestmentsGroupedByCategory` response with 60s stale time
