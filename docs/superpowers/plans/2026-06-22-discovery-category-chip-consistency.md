# Discovery Category Chip Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make category labels in Discovery use one consistent chip visual treatment across the scrollable menu and grouped category sections.

**Architecture:** Create a small reusable `DiscoveryCategoryChip` component that renders the existing icon-circle-plus-pill treatment. Use it in `CategoryChips` for interactive menu chips and in `DiscoverTrendingSection` for non-interactive category headers.

**Tech Stack:** React Native, Expo, Nativewind classes, existing `mockCategories` category tokens.

## Global Constraints

- Do not add dependencies.
- Preserve current Discovery category colors and icons.
- Keep grouped category headers non-interactive.
- Verify with `npm run lint` and `npx tsc --noEmit`.

---

### Task 1: Shared Discovery Category Chip

**Files:**
- Create: `src/components/discover/DiscoveryCategoryChip.tsx`
- Modify: `src/components/discover/CategoryChips.tsx`
- Modify: `src/components/discover/DiscoverTrendingSection.tsx`

**Interfaces:**
- Consumes: `Category` from `src/data/mock-categories.tsx`.
- Produces: `DiscoveryCategoryChip({ category, selected, onPress, onClear, className })`.

- [x] Create `DiscoveryCategoryChip` that renders the category icon and pill label in one reusable component.
- [x] Update `CategoryChips` to use `DiscoveryCategoryChip` for the horizontal scroll menu.
- [x] Update `DiscoverTrendingSection` category headers to use `DiscoveryCategoryChip` in read-only mode.
- [x] Run `npm run lint`.
- [x] Run `npx tsc --noEmit`.
