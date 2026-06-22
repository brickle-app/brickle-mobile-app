import { ViewStyle } from "react-native";

export interface TrendingAssetCardProps {
  id: string;
  name: string;
  price: number;
  bidsAvailable: number;
  riskLevel: { level: string; color: string };
  roi: string;
  imageUrl: string;
  miniatureImageUrl?: string | null;
  discoverImageUrl?: string | null;
  categoryType?: string;
  isNew?: boolean;
  onPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
  containerStyle?: ViewStyle;
}

export interface TrendingAssetCategoryColors {
  background: string;
  foreground: string;
}
