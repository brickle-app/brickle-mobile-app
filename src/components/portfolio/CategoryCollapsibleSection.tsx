import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DashboardInvestmentListRow } from "@/src/components/dashboard/DashboardInvestmentListRow";
import { Investment, Asset } from "@/src/interfaces/investments.interface";
import {
  getCategory,
  getCategoryIcon,
  getCategoryBgColor,
  getCategoryIconCircleBackground,
} from "@/src/utils/categories";
import { Colors } from "@/assets/Colors";
import { computeInvestmentOnChainPosition } from "@/src/utils/investmentOnChainPosition";
import type { InvestorOnChainSnapshot } from "@/src/utils/leasingInvestorReads";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CARD_RADIUS = 12;
const STRIP_WIDTH_PCT = "30%";
const ICON_BOX = 56;

interface CategoryCollapsibleSectionProps {
  category: string;
  investments: Investment[];
  isExpanded: boolean;
  onToggle: () => void;
  onAssetPress: (asset: Asset, investment: Investment) => void;
  snapshotsByInvestmentId?: Record<string, InvestorOnChainSnapshot>;
}

export const CategoryCollapsibleSection: React.FC<CategoryCollapsibleSectionProps> = ({
  category,
  investments,
  isExpanded,
  onToggle,
  onAssetPress,
  snapshotsByInvestmentId,
}) => {
  const stripBg = getCategoryBgColor(category);
  /** Icono sobre la franja: mismo contraste que el círculo del chip (no `iconGlyph`, que a veces coincide con el fondo). */
  const iconOnStripTint = getCategoryIconCircleBackground(category);
  const categoryIcon = getCategoryIcon(category);
  const meta = getCategory(category);
  const title = meta?.name ?? category;

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  const totalBricks = investments.reduce((sum, inv) => {
    const snap = snapshotsByInvestmentId?.[inv.id];
    const pos = computeInvestmentOnChainPosition(inv, snap);
    return sum + pos.bricksSortKey;
  }, 0);
  const activosLabel =
    investments.length === 1 ? "1 Activo" : `${investments.length} Activos`;
  const bricksRounded = Math.round(totalBricks * 100) / 100;
  const bricksLabel =
    bricksRounded === 1 ? "1 Brick" : `${bricksRounded.toLocaleString("es-CO", { maximumFractionDigits: 2 })} Bricks`;

  const renderIcon = () => {
    if (!categoryIcon) {
      return (
        <Ionicons name="grid-outline" size={32} color={iconOnStripTint} />
      );
    }
    try {
      return React.cloneElement(categoryIcon as React.ReactElement<{ width?: number; height?: number; color?: string }>, {
        width: ICON_BOX,
        height: ICON_BOX,
        color: iconOnStripTint,
      });
    } catch {
      return <Ionicons name="grid-outline" size={32} color={iconOnStripTint} />;
    }
  };

  return (
    <View className="w-full mb-3">
      <View style={styles.cardShadow}>
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          accessibilityLabel={`${title}, ${activosLabel}. ${isExpanded ? "Contraer" : "Expandir"}`}
        >
          <View style={styles.cardRow}>
            <View style={[styles.strip, { backgroundColor: stripBg }]}>
              {renderIcon()}
            </View>

            <View style={styles.textBlock}>
              <Text
                className="font-libre-bold text-text-primary"
                style={styles.categoryTitle}
                numberOfLines={1}
              >
                {title}
              </Text>
              <Text className="text-sm font-libre-regular text-gray-600" style={styles.metaLine}>
                {activosLabel}
              </Text>
              <Text className="text-sm font-libre-regular text-gray-600" numberOfLines={1}>
                {bricksLabel}
              </Text>
            </View>

            <View style={styles.chevronCol}>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={22}
                color={Colors.bluePrimary}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View className="mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Margen lateral: el contenido queda visualmente dentro del bloque de categoría */}
          <View className="px-4 pb-1 pt-1">
            {investments.map((investment, index) => (
              <DashboardInvestmentListRow
                key={investment.id ?? index}
                investment={investment}
                onChainSnapshot={snapshotsByInvestmentId?.[investment.id]}
                showBottomBorder={index < investments.length - 1}
                contentInset="nested"
                onPress={() => onAssetPress(investment.leasing, investment)}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    backgroundColor: Colors.white,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 96,
    backgroundColor: Colors.white,
  },
  strip: {
    width: STRIP_WIDTH_PCT,
    minWidth: 96,
    maxWidth: 132,
    borderTopLeftRadius: CARD_RADIUS,
    borderBottomLeftRadius: CARD_RADIUS,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  textBlock: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
  },
  categoryTitle: {
    fontSize: 17,
    lineHeight: 22,
    marginBottom: 4,
  },
  metaLine: {
    marginBottom: 2,
  },
  chevronCol: {
    justifyContent: "center",
    paddingRight: 14,
    paddingLeft: 4,
    backgroundColor: Colors.white,
  },
});
