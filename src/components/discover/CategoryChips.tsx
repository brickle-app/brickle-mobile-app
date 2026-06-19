import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { Category } from "@/src/data/mock-categories";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
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
            <TouchableOpacity
              key={category.name}
              style={{
                backgroundColor: isSelected ? Colors.bluePrimary : category.bgColor,
                borderWidth: isSelected ? 2 : 0,
                borderColor: isSelected ? Colors.bluePrimary : "transparent",
              }}
              className="rounded-full py-1 pl-0.5 pr-4 flex-row items-center gap-2"
              onPress={() => onCategoryPress(category.name)}
              activeOpacity={0.8}
            >
              {category.icon}
              <Text
                style={{ color: isSelected ? "#fff" : category.textColor }}
                className={`text-sm font-libre-bold`}
              >
                {category.text}
              </Text>
              {isSelected && (
                <TouchableOpacity onPress={() => onCategoryPress(null)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                  <Ionicons name="close-circle" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryChips;
