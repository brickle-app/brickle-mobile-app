import * as ImagePicker from "expo-image-picker";

export interface PaymentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  amount: string;
  onConfirmTransaction: (paymentProofUrl: string, amount: string) => void;
}

export type PaymentProofImage = Pick<ImagePicker.ImagePickerAsset, "uri"> | null;
