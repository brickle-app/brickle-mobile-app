import { useEffect, useState } from "react";
import { getDiscoverAssets } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { Asset } from "@/src/interfaces/investments.interface";

export const useFilteredCategories = () => {
  const user = authStore(state => state.user);
  const [selectedCategories, setSelectedCategories] = useState<string[] | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCategoryPress = (category: string | null) => {
    if (category === null) {
      setSelectedCategories(null);
    } else {
      setSelectedCategories([category]);
    }
    setAssets([]);
  };

  useEffect(() => {
    if (!user?.email || selectedCategories === null) {
      setAssets([]);
      return;
    }
    setLoading(true);
    const fetchAssets = async () => {
      const assets = await getDiscoverAssets(user.email || "", true, selectedCategories.join(","));
      setAssets(assets as Asset[]);
      setLoading(false);
    };
    fetchAssets();
  }, [user, selectedCategories]);

  return { selectedCategories, handleCategoryPress, assets, loading };
};