/** Satıcıya gönderilecek hazır iade mesajı şablonu. */
export function sellerReturnMessage(productName: string): string {
  return `Merhaba, ${productName} adlı ürün için yasal iade süresi içinde iade talebi oluşturmak istiyorum. Ürün bilgileri ve fatura detayları ekte yer almaktadır. Sürecin başlatılması için tarafıma bilgi verilmesini rica ederim.`;
}

export const LEGAL_DISCLAIMER =
  "Aldım hukuki danışmanlık vermez. Belgelerini düzenlemene, tarihleri takip etmene ve süreçlerini kayıt altında tutmana yardımcı olur.";
