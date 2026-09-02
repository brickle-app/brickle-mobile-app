import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DocumentSignatureRecord {
  documentId: string;
  /** Path data (SVG "d" attributes) captured from the on-screen signature pad. */
  svgPaths: string[];
  signedAt: string;
  signerName: string;
}

interface DocumentSignatureState {
  signatures: Record<string, DocumentSignatureRecord>;
  saveSignature: (record: DocumentSignatureRecord) => void;
  clearSignature: (documentId: string) => void;
  isSigned: (documentId: string) => boolean;
}

export const documentSignatureStore = create<DocumentSignatureState>()(
  persist(
    (set, get) => ({
      signatures: {},
      saveSignature: (record) =>
        set((state) => ({
          signatures: { ...state.signatures, [record.documentId]: record },
        })),
      clearSignature: (documentId) =>
        set((state) => {
          const next = { ...state.signatures };
          delete next[documentId];
          return { signatures: next };
        }),
      isSigned: (documentId) => Boolean(get().signatures[documentId]),
    }),
    {
      name: "document-signature-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
