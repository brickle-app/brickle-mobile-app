import { useCallback, useEffect, useState } from "react";
import { getDiscoverAssets } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { Asset } from "@/src/interfaces/investments.interface";

export const useFilteredCategories = () => {
  const userEmail = authStore(state => state.user?.email);
  const [selectedCategories, setSelectedCategories] = useState<string[] | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCategoryPress = useCallback((category: string | null) => {
    if (category === null) {
      setSelectedCategories(null);
    } else {
      setSelectedCategories([category]);
    }
    setAssets([]);
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (!userEmail || selectedCategories === null) {
      setAssets([]);
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    setErrorMessage(null);

    const fetchAssets = async () => {
      try {
        const categoryAssets = await getDiscoverAssets(userEmail, true, selectedCategories.join(","));
        if (!ignore) setAssets(categoryAssets as Asset[]);
      } catch (error) {
        console.error("Error fetching category assets:", error);
        if (!ignore) {
          setAssets([]);
          setErrorMessage("No pudimos cargar los activos de esta categoría. Intenta nuevamente.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchAssets();
    return () => {
      ignore = true;
    };
  }, [userEmail, selectedCategories]);

  return { selectedCategories, handleCategoryPress, assets, loading, errorMessage };
};
