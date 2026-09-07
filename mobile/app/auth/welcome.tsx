import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { useAuth } from "../../lib/auth";
import { colors, fontSize, radius, spacing } from "../../lib/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const { configured } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <Ionicons
            name="lock-closed-outline"
            size={42}
            color={colors.brand[700]}
          />
        </View>
        <Text style={styles.title}>Hesabınla devam et</Text>
        <Text style={styles.desc}>
          Kayıtlarını, hatırlatmalarını ve belgelerini güvenle saklamak için
          hesabına giriş yap.
        </Text>
      </View>

      <View style={styles.actions}>
        {configured ? (
          <>
            <Button
              title="Hesap oluştur"
              onPress={() => router.push("/auth/sign-up")}
              fullWidth
            />
            <Button
              title="Giriş yap"
              variant="outline"
              onPress={() => router.push("/auth/sign-in")}
              fullWidth
            />
          </>
        ) : (
          <View style={styles.notice}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.warn[600]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>
                Giriş sistemi yapılandırılmamış
              </Text>
              <Text style={styles.noticeText}>
                Supabase anahtarlarını{" "}
                <Text style={styles.code}>.env.local</Text> dosyasına
                eklemelisin:
                {"\n"}
                <Text style={styles.code}>EXPO_PUBLIC_SUPABASE_URL</Text>
                {"\n"}
                <Text style={styles.code}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
                {"\n\n"}
                Anahtarları ekleyip uygulamayı yeniden başlat.
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    justifyContent: "space-between",
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: "700",
    color: colors.ink[900],
    textAlign: "center",
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: fontSize.md,
    color: colors.ink[600],
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 24,
    maxWidth: 320,
  },
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  notice: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.warn[50],
    borderColor: colors.warn[100],
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "flex-start",
  },
  noticeTitle: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.warn[600],
    marginBottom: 4,
  },
  noticeText: {
    fontSize: fontSize.sm,
    color: colors.warn[600],
    lineHeight: 20,
  },
  code: {
    fontFamily: "Courier",
    fontWeight: "600",
  },
});
