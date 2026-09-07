import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Card, CardTitle } from "./Card";
import { Button } from "./Button";
import { Field, TextField, DateField } from "./Field";
import { useAldimStore } from "../lib/store";
import { todayIso, formatDateTR } from "../lib/date-utils";
import { colors } from "../lib/theme";
export function ServiceHistory({ itemId }: { itemId: string }) {
  const { items, addServiceRecord, updateItem } = useAldimStore();
  const item = items.find((i) => i.id === itemId);
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIso());
  const [followup, setFollowup] = useState("");
  const [busy, setBusy] = useState(false);
  if (!item) return null;
  return (
    <Card style={{ gap: 14 }}>
      <CardTitle>Servis geçmişi</CardTitle>
      {item.serviceRecords.length === 0 && !open && (
        <Text style={{ color: colors.ink[500], lineHeight: 21 }}>
          Bakım ve onarım işlemlerini, firma bilgisini ve takip tarihini burada
          tut.
        </Text>
      )}
      {item.serviceRecords.map((r) => (
        <View
          key={r.id}
          style={{
            gap: 8,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: colors.ink[100],
          }}
        >
          <Text style={{ fontWeight: "700", color: colors.ink[900] }}>
            {r.company}
          </Text>
          <Text style={{ color: colors.ink[500] }}>{r.description}</Text>
          <Text style={{ fontSize: 12, color: colors.ink[400] }}>
            {formatDateTR(r.date)} ·{" "}
            {r.status === "resolved" ? "Tamamlandı" : "Devam ediyor"}
          </Text>
          {r.status !== "resolved" && (
            <Button
              title="Servis tamamlandı"
              variant="outline"
              onPress={async () => {
                try {
                  await updateItem(itemId, {
                    serviceRecords: item.serviceRecords.map((x) =>
                      x.id === r.id ? { ...x, status: "resolved" } : x,
                    ),
                  });
                } catch (e) {
                  Alert.alert("Kaydedilemedi", (e as Error).message);
                }
              }}
            />
          )}
        </View>
      ))}
      {open && (
        <View style={{ gap: 12 }}>
          <Field label="Servis / firma">
            <TextField value={company} onChangeText={setCompany} />
          </Field>
          <Field label="Yapılan işlem / sorun">
            <TextField
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </Field>
          <Field label="Servis tarihi">
            <DateField value={date} onChange={setDate} />
          </Field>
          <Field label="Sonraki takip tarihi (isteğe bağlı)">
            <DateField value={followup} onChange={setFollowup} />
          </Field>
          <Button
            title="Servis kaydını kaydet"
            loading={busy}
            onPress={async () => {
              if (!company.trim() || !description.trim()) {
                Alert.alert("Eksik bilgi", "Firma ve açıklamayı gir.");
                return;
              }
              setBusy(true);
              try {
                await addServiceRecord(itemId, {
                  company: company.trim(),
                  description: description.trim(),
                  date,
                  status: "open",
                  nextFollowUpDate: followup || undefined,
                });
                setOpen(false);
                setCompany("");
                setDescription("");
              } catch (e) {
                Alert.alert("Kaydedilemedi", (e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          />
        </View>
      )}
      <Button
        title={open ? "Vazgeç" : "Servis kaydı ekle"}
        variant="outline"
        onPress={() => setOpen(!open)}
      />
    </Card>
  );
}
