import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { Field, TextField } from "../../components/Field";
import { useAuth } from "../../lib/auth";
import { colors, fontSize, spacing } from "../../lib/theme";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (saving) return;
    if (!email.trim() || !password) {
      Alert.alert("Eksik bilgi", "E-posta ve şifre gerekli.");
      return;
    }
    setSaving(true);
    try {
      const r = await signIn(email.trim(), password);
      if (!r.ok) Alert.alert("Giriş başarısız", r.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Giriş yap</Text>
        <Text style={styles.desc}>Aldım hesabınla devam et.</Text>

        <View style={{ marginTop: spacing.xl }}>
          <Field label="E-posta">
            <TextField
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="ornek@aldim.app"
            />
          </Field>
          <Field label="Şifre">
            <TextField
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </Field>

          <Pressable onPress={() => router.push("/auth/forgot-password")}>
            <Text style={styles.link}>Şifremi unuttum</Text>
          </Pressable>

          <View style={{ marginTop: spacing.lg }}>
            <Button title="Giriş yap" onPress={onSubmit} loading={saving} fullWidth />
          </View>

          <View style={styles.altRow}>
            <Text style={styles.altText}>Hesabın yok mu?</Text>
            <Pressable onPress={() => router.replace("/auth/sign-up")}>
              <Text style={styles.altLink}>Hesap oluştur</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing["3xl"] },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: "700",
    color: colors.ink[900],
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: fontSize.md,
    color: colors.ink[500],
    marginTop: 4,
  },
  link: {
    fontSize: fontSize.sm,
    color: colors.brand[700],
    fontWeight: "600",
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    textAlign: "right",
  },
  altRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.xl,
  },
  altText: { fontSize: fontSize.sm, color: colors.ink[600] },
  altLink: { fontSize: fontSize.sm, color: colors.brand[700], fontWeight: "700" },
});
