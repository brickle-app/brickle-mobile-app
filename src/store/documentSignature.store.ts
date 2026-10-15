import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DocumentSignatureRecord {
  /** Owner of the signature: several accounts can sign in on the same device. */
  userId: string;
  documentId: string;
  /** Path data (SVG "d" attributes) captured from the on-screen signature pad. */
  svgPaths: string[];
  signedAt: string;
  signerName: string;
}

interface DocumentSignatureState {
  /** userId -> documentId -> signature */
  signatures: Record<string, Record<string, DocumentSignatureRecord>>;
  saveSignature: (record: DocumentSignatureRecord) => void;
  clearSignature: (userId: string, documentId: string) => void;
  getSignature: (userId: string | undefined, documentId: string) => DocumentSignatureRecord | undefined;
  isSigned: (userId: string | undefined, documentId: string) => boolean;
}

export const documentSignatureStore = create<DocumentSignatureState>()(
  persist(
    (set, get) => ({
      signatures: {},
      saveSignature: (record) =>
        set((state) => ({
          signatures: {
            ...state.signatures,
            [record.userId]: { ...state.signatures[record.userId], [record.documentId]: record },
          },
        })),
      clearSignature: (userId, documentId) =>
        set((state) => {
          const forUser = { ...state.signatures[userId] };
          delete forUser[documentId];
          return { signatures: { ...state.signatures, [userId]: forUser } };
        }),
      getSignature: (userId, documentId) =>
        userId ? get().signatures[userId]?.[documentId] : undefined,
      isSigned: (userId, documentId) => Boolean(get().getSignature(userId, documentId)),
    }),
    {
      name: "document-signature-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // v0 stored signatures by documentId only, so a new account on the same device appeared as
      // having signed. Those records can't be attributed to a user, so they are dropped.
      version: 1,
      migrate: () => ({ signatures: {} }) as Partial<DocumentSignatureState> as DocumentSignatureState,
    }
  )
);
