# Native Birth Date Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual birth date typing with a native iOS/Android date picker and enforce adult dates consistently.

**Architecture:** Add a focused reusable `DatePickerField` component that owns native picker UI and date formatting. Use it from complete-profile and personal-details forms, preserving existing form state as `DD/MM/YYYY` strings consumed by current API conversion code.

**Tech Stack:** React Native, Expo, `@react-native-community/datetimepicker`, React Hook Form, Jest.

## Global Constraints

- No new dependency; `@react-native-community/datetimepicker` already exists.
- No manual typing for birth date fields.
- UI format remains `DD/MM/YYYY`.
- Accepted birth dates must be at least 18 years old.
- Keep changes focused to birth date selection.

---

### Task 1: Date Helpers

**Files:**
- Create: `src/utils/datePicker.ts`
- Test: `src/utils/datePicker.test.ts`

**Interfaces:**
- Produces: `formatDateForDisplay(date: Date): string`, `parseDisplayDate(value?: string): Date | undefined`, `getAdultMaximumDate(today?: Date): Date`, `isAdultDisplayDate(value: string, today?: Date): boolean`

- [ ] Write failing tests for formatting, parsing, and 18-year max date.
- [ ] Run `npx jest src/utils/datePicker.test.ts --runInBand` and confirm RED.
- [ ] Implement date helper functions.
- [ ] Run focused tests and confirm GREEN.

### Task 2: Native DatePickerField

**Files:**
- Create: `src/components/ui/input/DatePickerField.tsx`
- Modify: `src/components/ui/input/index.ts`

**Interfaces:**
- Consumes: date helpers from Task 1.
- Produces: `<DatePickerField label value onChangeText error />` compatible with existing form strings.

- [ ] Implement `Pressable` field matching `FormField` styling.
- [ ] Show native `DateTimePicker` on press.
- [ ] Set `maximumDate` to `getAdultMaximumDate()` and `minimumDate` to `1900-01-01`.
- [ ] On selection, call `onChangeText(formatDateForDisplay(selectedDate))`.

### Task 3: Wire Forms And Validation

**Files:**
- Modify: `src/components/auth/completeProfileForm/CompleteProfileForm.tsx`
- Modify: `app/(stack)/(tabs)/profile/personal-details/index.tsx`
- Modify: `src/schemes/complete-profile-scheme.ts`
- Modify: `src/schemes/personal-details-scheme.ts`
- Modify: `src/constants/auth/complete-profile.inputs.tsx`

**Interfaces:**
- Consumes: `DatePickerField` and `isAdultDisplayDate`.

- [ ] Render `DatePickerField` for `birthDate` in complete profile.
- [ ] Render `DatePickerField` for `dateOfBirth` in personal details.
- [ ] Remove birth date mask/manual number-pad config.
- [ ] Update schemas to reject invalid format and under-18 dates.
- [ ] Run `npx jest --runInBand`, `npm run lint`, and `npx tsc --noEmit`.
