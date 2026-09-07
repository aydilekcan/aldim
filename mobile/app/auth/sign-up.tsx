import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { Field, TextField } from "../../components/Field";
import { useAuth } from "../../lib/auth";
import { colors, fontSize, spacing } from "../../lib/theme";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (saving) return;
    if (!email.trim() || !password) {
      Alert.alert("Eksik bilgi", "E-posta ve şifre gerekli.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Şifre kısa", "Şifre en az 6 karakter olmalı.");
      return;
    }
    setSaving(true);
    try {
      const r = await signUp(email.trim(), password);
      if (!r.ok) {
        Alert.alert("Kayıt başarısız", r.error);
      } else {
        Alert.alert(
          "Hesap oluşturuldu",
          "E-postana doğrulama bağlantısı gönderildi. Doğruladıktan sonra giriş yapabilirsin.",
        );
        router.replace("/auth/sign-in");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.white }}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Hesap oluştur</Text>
        <Text style={styles.desc}>
          Aldıkların seninle, cihaz fark etmeksizin.
        </Text>

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
          <Field label="Şifre" hint="En az 6 karakter">
            <TextField
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </Field>

          <View style={{ marginTop: spacing.lg }}>
            <Button
              title="Hesap oluştur"
              onPress={onSubmit}
              loading={saving}
              fullWidth
            />
          </View>

          <View style={styles.altRow}>
            <Text style={styles.altText}>Zaten hesabın var mı?</Text>
            <Pressable onPress={() => router.replace("/auth/sign-in")}>
              <Text style={styles.altLink}>Giriş yap</Text>
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
  desc: { fontSize: fontSize.md, color: colors.ink[500], marginTop: 4 },
  altRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.xl,
  },
  altText: { fontSize: fontSize.sm, color: colors.ink[600] },
  altLink: {
    fontSize: fontSize.sm,
    color: colors.brand[700],
    fontWeight: "700",
  },
});
