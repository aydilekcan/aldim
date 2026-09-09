import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors } from "../lib/theme";

export function SearchField({ value, onChangeText, placeholder }: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name="search-outline" size={19} color={colors.ink[500]} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessibilityLabel={placeholder}
        placeholderTextColor={colors.ink[500]}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityLabel="Aramayı temizle"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => onChangeText("")}
        >
          <Ionicons name="close-circle" size={21} color={colors.ink[500]} />
        </Pressable>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderColor: colors.ink[300],
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  input: { flex: 1, minHeight: 48, fontSize: 15, color: colors.ink[900] },
});
