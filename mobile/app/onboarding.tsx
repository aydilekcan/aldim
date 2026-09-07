import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { ensureNotificationPermission } from "../lib/notifications";
import { useAldimStore } from "../lib/store";
import { colors, fontSize, radius, spacing } from "../lib/theme";

const { width } = Dimensions.get("window");

interface Slide {
  icon: keyof typeof import("@expo/vector-icons/build/Ionicons").default.glyphMap;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    icon: "bag-handle-outline",
    title: "Aldıklarını takip et.",
    description:
      "Ürünlerini, araçlarını ve faturalarını tek yerde sakla. Aradığını dakikalar değil saniyeler içinde bul.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Garanti, iade ve servis tarihlerini kaçırma.",
    description:
      "İade süresi, garanti, muayene, MTV ve sigorta tarihleri — hepsi otomatik takip altında.",
  },
  {
    icon: "notifications-outline",
    title: "Bildirimlerle zamanında haber al.",
    description:
      "Süre yaklaşınca telefonun çalsın. Aksiyon alacak vaktin olsun.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { updateSettings, completeOnboarding } = useAldimStore();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (page < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
    }
  };

  const onFinish = async (askPermission: boolean) => {
    let granted = false;
    if (askPermission) {
      granted = await ensureNotificationPermission();
    }
    updateSettings({ notificationsEnabled: granted });
    completeOnboarding();
    // Auth ekranına yönlendir — RouteGate user yoksa /auth/welcome'a düşürür.
    router.replace("/auth/welcome");
  };

  const isLast = page === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.skipRow}>
        {!isLast && (
          <Pressable hitSlop={12} onPress={() => onFinish(false)}>
            <Text style={styles.skip}>Atla</Text>
          </Pressable>
        )}
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: (e) => {
              const idx = Math.round(
                (e.nativeEvent as { contentOffset: { x: number } }).contentOffset.x / width,
              );
              setPage(idx);
            },
          },
        )}
        scrollEventThrottle={16}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={{ width, paddingHorizontal: spacing["2xl"] }}>
            <View style={styles.iconWrap}>
              <Ionicons name={s.icon} size={56} color={colors.brand[700]} />
            </View>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.desc}>{s.description}</Text>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Dot indicator */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === page ? colors.brand[700] : colors.ink[200] },
              i === page && { width: 22 },
            ]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        {isLast ? (
          <>
            <Button
              title={
                Platform.OS === "ios" || Platform.OS === "android"
                  ? "Bildirimleri aç ve ilk ürününü ekle"
                  : "İlk ürününü ekle"
              }
              onPress={() => onFinish(true)}
              fullWidth
            />
            <Pressable onPress={() => onFinish(false)} style={{ marginTop: spacing.md }}>
              <Text style={styles.secondary}>Şimdilik bildirim açmayayım</Text>
            </Pressable>
          </>
        ) : (
          <Button title="Devam" onPress={goNext} fullWidth />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipRow: {
    paddingHorizontal: spacing.xl,
    height: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  skip: {
    fontSize: fontSize.sm,
    color: colors.ink[500],
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: spacing["3xl"],
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
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  secondary: {
    fontSize: fontSize.sm,
    color: colors.ink[500],
    textAlign: "center",
  },
});
