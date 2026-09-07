import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { TextInputProps } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, fontSize, radius, spacing } from "../lib/theme";
import { formatDateTR } from "../lib/date-utils";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function TextField({ style, ...rest }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.ink[400]}
      style={[styles.input, style]}
      {...rest}
    />
  );
}

/** Native date picker — iOS spinner, Android default dialog. */
export function DateField({
  value,
  onChange,
  placeholder = "Tarih seç",
  minimumDate,
}: {
  value?: string; // YYYY-MM-DD
  onChange: (iso: string) => void;
  placeholder?: string;
  minimumDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const current = value ? parseLocal(value) : new Date();

  const handleChange = (_: unknown, picked?: Date) => {
    if (Platform.OS !== "ios") setOpen(false);
    if (picked) onChange(toIso(picked));
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.input,
          styles.dateInput,
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text
          style={{
            color: value ? colors.ink[900] : colors.ink[400],
            fontSize: fontSize.base,
          }}
        >
          {value ? formatDateTR(value) : placeholder}
        </Text>
      </Pressable>
      {open && (
        <View style={Platform.OS === "ios" ? styles.iosPickerWrap : undefined}>
          <DateTimePicker
            value={current}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={minimumDate}
            onChange={handleChange}
            locale="tr-TR"
          />
          {Platform.OS === "ios" && (
            <Pressable style={styles.iosDone} onPress={() => setOpen(false)}>
              <Text style={{ color: colors.brand[700], fontWeight: "600" }}>
                Tamam
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function parseLocal(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(iso);
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.ink[800],
    marginBottom: 6,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.ink[500],
    marginTop: 4,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger[600],
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ink[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.base,
    color: colors.ink[900],
    minHeight: 48,
  },
  dateInput: {
    justifyContent: "center",
  },
  iosPickerWrap: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.ink[200],
  },
  iosDone: {
    alignItems: "flex-end",
    padding: spacing.md,
  },
});
