import { View, ScrollView } from "react-native";
import React from "react";
import { Category } from "@/src/data/mock-categories";
import { DiscoveryCategoryChip } from "./DiscoveryCategoryChip";
//import { getCategories } from "@/src/utils/categories";

interface CategoryChipsProps {
  //categories: ReturnType<typeof getCategories>;
  categories: Category[];
  selectedCategories: string[];
  onCategoryPress: (categoryId: string | null) => void;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategories,
  onCategoryPress,
}) => {

  return (
    <View>
      {/* Horizontal scrollable row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        style={{ flexGrow: 0 }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.name);
          return (
            <DiscoveryCategoryChip
              key={category.name}
              category={category}
              selected={isSelected}
              onPress={() => onCategoryPress(category.name)}
              onClear={isSelected ? () => onCategoryPress(null) : undefined}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryChips;
