import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import {
  SEED_PHRASE_LENGTH,
  applyWordsAt,
  emptySeedWords,
  isValidSeedWord,
  splitSeedWords,
} from "@/src/utils/seedPhrase";

interface SeedPhraseInputProps {
  words: string[];
  onChangeWords: (words: string[]) => void;
  onPasteFromClipboard?: () => void;
  isPasting?: boolean;
  disabled?: boolean;
}

const COLUMNS = 3;

/**
 * 12 individual cells for a recovery phrase. A space (or a pasted phrase) moves to the next cell, so
 * the user can't merge two words by forgetting a space, and every word is checked against BIP39.
 */
export function SeedPhraseInput({
  words,
  onChangeWords,
  onPasteFromClipboard,
  isPasting = false,
  disabled = false,
}: SeedPhraseInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  // What each native input currently shows. The inputs are uncontrolled while typing (a controlled
  // input drops characters when typing outpaces React state), so we only push text down when `words`
  // changes for another reason: paste, word spreading or clearing.
  const nativeText = useRef<string[]>(words.slice());
  // Always-current words: handlers can fire several times before React re-renders with new props.
  const wordsRef = useRef(words);
  wordsRef.current = words;
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [touched, setTouched] = useState<Set<number>>(new Set());
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    words.forEach((word, index) => {
      if (nativeText.current[index] !== word) {
        nativeText.current[index] = word;
        inputs.current[index]?.setNativeProps({ text: word });
      }
    });
  }, [words]);

  const focusCell = useCallback((index: number) => {
    inputs.current[Math.max(0, Math.min(index, SEED_PHRASE_LENGTH - 1))]?.focus();
  }, []);

  const handleChangeText = (index: number, text: string) => {
    const incoming = splitSeedWords(text);

    // Plain typing inside one word, no space yet.
    if (incoming.length <= 1 && !/\s$/.test(text)) {
      nativeText.current[index] = text;
      const next = [...wordsRef.current];
      next[index] = incoming[0] ?? "";
      wordsRef.current = next;
      onChangeWords(next);
      return;
    }

    // A space, or several words pasted: spread them over the following cells. The effect above
    // rewrites the native text of every cell whose word changed (including trimming this one).
    nativeText.current[index] = text;
    const { words: next, nextIndex } = applyWordsAt(wordsRef.current, index, incoming);
    wordsRef.current = next;
    onChangeWords(next);
    if (incoming.length > 1) Haptics.selectionAsync().catch(() => {});
    const endsWithSpace = /\s$/.test(text);
    focusCell(endsWithSpace && incoming.length === 1 ? index + 1 : nextIndex);
  };

  const handleKeyPress = (index: number, event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (event.nativeEvent.key === "Backspace" && !wordsRef.current[index] && index > 0) {
      focusCell(index - 1);
    }
  };

  const handleBlur = (index: number) => {
    setFocusedIndex((current) => (current === index ? null : current));
    setTouched((current) => new Set(current).add(index));
  };

  const filledCount = words.filter(Boolean).length;
  const hasAnyWord = filledCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.counter}>
          {filledCount}/{SEED_PHRASE_LENGTH} palabras
        </Text>
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            onPress={() => setHidden((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar palabras" : "Ocultar palabras"}
            hitSlop={8}
            style={styles.toolbarButton}
          >
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={Colors.bluePrimary} />
          </TouchableOpacity>
          {onPasteFromClipboard && (
            <TouchableOpacity
              onPress={onPasteFromClipboard}
              disabled={isPasting || disabled}
              accessibilityRole="button"
              accessibilityLabel="Pegar desde portapapeles"
              hitSlop={8}
              style={styles.toolbarButton}
            >
              <Ionicons name="clipboard-outline" size={20} color={Colors.bluePrimary} />
              <Text style={styles.toolbarButtonText}>Pegar</Text>
            </TouchableOpacity>
          )}
          {hasAnyWord && (
            <TouchableOpacity
              onPress={() => {
                onChangeWords(emptySeedWords());
                setTouched(new Set());
                focusCell(0);
              }}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel="Borrar todas las palabras"
              hitSlop={8}
              style={styles.toolbarButton}
            >
              <Text style={styles.toolbarButtonText}>Borrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.grid}>
        {words.map((word, index) => {
          const isFocused = focusedIndex === index;
          const showInvalid = !isFocused && touched.has(index) && word.length > 0 && !isValidSeedWord(word);
          const isLast = index === SEED_PHRASE_LENGTH - 1;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                isFocused && styles.cellFocused,
                showInvalid && styles.cellInvalid,
                disabled && styles.cellDisabled,
              ]}
            >
              <Text style={styles.cellIndex}>{index + 1}</Text>
              <TextInput
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
                defaultValue={word}
                onChangeText={(text) => handleChangeText(index, text)}
                onKeyPress={(event) => handleKeyPress(index, event)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => handleBlur(index)}
                onSubmitEditing={() => (isLast ? inputs.current[index]?.blur() : focusCell(index + 1))}
                editable={!disabled}
                style={styles.cellInput}
                secureTextEntry={hidden}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
                keyboardType="default"
                returnKeyType={isLast ? "done" : "next"}
                blurOnSubmit={false}
                selectTextOnFocus
                maxLength={64}
                accessibilityLabel={`Palabra ${index + 1} de ${SEED_PHRASE_LENGTH}`}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", gap: 12 },
  toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toolbarActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  toolbarButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  toolbarButtonText: { fontFamily: "LibreFranklin-Bold", fontSize: 14, color: Colors.bluePrimary },
  counter: { fontFamily: "LibreFranklin-Regular", fontSize: 13, color: Colors.textPrimary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: {
    flexBasis: `${100 / COLUMNS - 2}%`,
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#B4BAB6",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  cellFocused: { borderColor: Colors.bluePrimary, backgroundColor: "#FFFFFF" },
  cellInvalid: { borderColor: Colors.red },
  cellDisabled: { opacity: 0.5 },
  cellIndex: {
    width: 18,
    fontFamily: "LibreFranklin-Regular",
    fontSize: 11,
    color: "#7A8A83",
  },
  cellInput: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: "LibreFranklin-Regular",
    fontSize: 15,
    color: Colors.textPrimary,
  },
});
