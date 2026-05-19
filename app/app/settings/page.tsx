"use client";

import { Bell, Download, RefreshCw, User, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label, FieldHint } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAldimStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { LEGAL_DISCLAIMER } from "@/lib/templates";
import { todayIso } from "@/lib/date-utils";

export default function SettingsPage() {
  const { settings, updateSettings, products, resetToDemo } = useAldimStore();
  const { success, info } = useToast();

  const onExport = () => {
    const blob = new Blob([JSON.stringify({ settings, products }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aldim-export-${todayIso()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success("Verilerin JSON olarak indirildi.");
  };

  const onSave = () => {
    success("Tercihler kaydedildi.");
  };

  const onReset = () => {
    if (typeof window !== "undefined" && !window.confirm("Tüm veriler demo verisine sıfırlansın mı?")) {
      return;
    }
    resetToDemo();
    info("Demo verisine geri dönüldü.");
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Ayarlar"
        description="Profilini, uyarı eşiklerini ve veri tercihlerini yönet."
      />

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-brand-700" /> Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="profile-name">Görünür ad</Label>
            <Input
              id="profile-name"
              value={settings.profileName}
              onChange={(e) => updateSettings({ profileName: e.target.value })}
            />
            <FieldHint>Bu MVP'de yalnızca kullanıcı arayüzünde gösterilir.</FieldHint>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand-700" /> Bildirim tercihleri
            </CardTitle>
            <CardDescription>
              Süre yaklaştıkça Aldım dashboard'da uyarı şeritlerini gösterir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between rounded-xl border border-ink-100 p-4">
              <div>
                <p className="text-sm font-medium text-ink-900">Uyarılar açık</p>
                <p className="text-xs text-ink-500">Garanti ve iade uyarılarını göster.</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-ink-300"
                checked={settings.notificationsEnabled}
                onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
              />
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warranty-warn">Garanti bitmeden uyarı (gün)</Label>
                <Input
                  id="warranty-warn"
                  type="number"
                  min={0}
                  max={365}
                  value={settings.warrantyWarnDays}
                  onChange={(e) =>
                    updateSettings({ warrantyWarnDays: Math.max(0, Number(e.target.value) || 0) })
                  }
                />
                <FieldHint>Önerilen: 30 gün.</FieldHint>
              </div>
              <div>
                <Label htmlFor="return-warn">İade süresi bitmeden uyarı (gün)</Label>
                <Input
                  id="return-warn"
                  type="number"
                  min={0}
                  max={60}
                  value={settings.returnWarnDays}
                  onChange={(e) =>
                    updateSettings({ returnWarnDays: Math.max(0, Number(e.target.value) || 0) })
                  }
                />
                <FieldHint>Önerilen: 5 gün.</FieldHint>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tema</CardTitle>
            <CardDescription>Karanlık mod ileride eklenecek.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="inline-flex rounded-xl bg-ink-100 p-1 text-sm">
              <button
                className="px-4 py-1.5 rounded-lg bg-white shadow-sm font-medium text-ink-900"
                disabled
              >
                Açık
              </button>
              <button className="px-4 py-1.5 rounded-lg text-ink-500" disabled>
                Sistem
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Veri</CardTitle>
            <CardDescription>Verilerini dışa aktar veya demo verisine sıfırla.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={onExport}>
              <Download className="h-4 w-4" /> JSON olarak dışa aktar
            </Button>
            <Button variant="ghost" className="gap-2 text-danger-600 hover:bg-danger-50" onClick={onReset}>
              <RefreshCw className="h-4 w-4" /> Demo verisine sıfırla
            </Button>
          </CardContent>
        </Card>

        <div className="rounded-2xl bg-brand-50 border border-brand-100 p-5 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-brand-700 shrink-0 mt-0.5" />
          <p className="text-sm text-brand-900">{LEGAL_DISCLAIMER}</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave}>Tercihleri kaydet</Button>
        </div>
      </div>
    </div>
  );
}
