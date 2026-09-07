import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { Field, TextField } from "../../components/Field";
import { useAuth } from "../../lib/auth";
import { colors, fontSize, spacing } from "../../lib/theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (saving) return;
    if (!email.trim()) {
      Alert.alert("Eksik bilgi", "E-postanı gir.");
      return;
    }
    setSaving(true);
    try {
      const r = await resetPassword(email.trim());
      if (!r.ok) Alert.alert("Hata", r.error);
      else {
        Alert.alert(
          "Bağlantı gönderildi",
          "Şifre sıfırlama bağlantısı e-postana gönderildi.",
        );
        router.back();
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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Şifremi unuttum</Text>
        <Text style={styles.desc}>
          E-postanı gir, sana sıfırlama bağlantısı gönderelim.
        </Text>
        <View style={{ marginTop: spacing.xl }}>
          <Field label="E-posta">
            <TextField
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Field>
          <View style={{ marginTop: spacing.lg }}>
            <Button
              title="Bağlantı gönder"
              onPress={onSubmit}
              loading={saving}
              fullWidth
            />
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
});
