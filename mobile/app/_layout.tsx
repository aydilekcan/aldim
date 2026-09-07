import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../lib/auth";
import { AldimStoreProvider, useAldimStore } from "../lib/store";
import { colors } from "../lib/theme";

function RouteGate() {
  const { user, loading: authLoading } = useAuth();
  const { hydrated, settings } = useAldimStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const open = (response: Notifications.NotificationResponse) => {
      const itemId = response.notification.request.content.data?.itemId;
      if (user && typeof itemId === "string" && /^[0-9a-f-]{36}$/i.test(itemId)) router.push(`/item/${itemId}`);
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    void Notifications.getLastNotificationResponseAsync().then(response => { if (response) { open(response); void Notifications.clearLastNotificationResponseAsync().catch(() => {}); } }).catch(() => {});
    return () => subscription.remove();
  }, [user, router]);

  useEffect(() => {
    if (authLoading || !hydrated) return;

    const first = segments[0] ?? "";
    const inOnboarding = first === "onboarding";
    const inAuth = first === "auth";

    // 1) Onboarding tamamlanmamışsa → onboarding
    if (!settings.onboardingComplete) {
      if (!inOnboarding) router.replace("/onboarding");
      return;
    }

    // 2) Oturum yok → auth/welcome
    if (!user) {
      if (!inAuth) router.replace("/auth/welcome");
      return;
    }

    // 3) Oturum var ama hâlâ auth/onboarding'de → tabs
    if (inAuth || inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [authLoading, hydrated, settings.onboardingComplete, user, segments, router]);

  return null;
}


function UserStore({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <AldimStoreProvider key={user?.id ?? 'signed-out'}>{children}</AldimStoreProvider>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ink[50] }}>
      <SafeAreaProvider>
        <AuthProvider>
          <UserStore>
            <RouteGate />
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.white },
                headerTitleStyle: { color: colors.ink[900], fontWeight: "600" },
                headerTintColor: colors.brand[700],
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.ink[50] },
                // iOS: "(tabs)" gibi parent route adlarını back button'da gösterme;
                // sadece chevron çıksın. Android'de zaten gösterilmez.
                headerBackTitle: "",
                headerBackButtonDisplayMode: "minimal",
              }}
            >
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
              <Stack.Screen name="auth/sign-in" options={{ title: "Giriş yap" }} />
              <Stack.Screen name="auth/sign-up" options={{ title: "Hesap oluştur" }} />
              <Stack.Screen
                name="auth/forgot-password"
                options={{ title: "Şifremi unuttum" }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="item/new"
                options={{ title: "Yeni kayıt" }}
              />
              <Stack.Screen name="item/[id]" options={{ title: "Kayıt detayı" }} />
              <Stack.Screen
                name="item/[id]/edit"
                options={{ title: "Düzenle" }}
              />
              <Stack.Screen name="document/[id]" options={{ title: "Belge" }} />
              <Stack.Screen name="spending" options={{ title: "Harcamalar" }} />
              <Stack.Screen name="settings" options={{ title: "Ayarlar" }} />
            </Stack>
          </UserStore>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
