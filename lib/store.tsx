"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_SETTINGS, MOCK_PRODUCTS } from "./mock-data";
import { computeProductStatus } from "./status";
import type {
  AldimDocument,
  AppSettings,
  Product,
  ReturnProcess,
  ServiceRecord,
} from "./types";
import { uid } from "./utils";

const STORAGE_KEY = "aldim:state:v1";

interface PersistedState {
  products: Product[];
  settings: AppSettings;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Bozuk öğeleri sessizce eler, yalnızca geçerli ürünleri döner. */
function sanitizeProducts(input: unknown): Product[] {
  if (!Array.isArray(input)) return [];
  const result: Product[] = [];
  for (const raw of input) {
    if (!isObject(raw)) continue;
    const p = raw as Partial<Product>;
    if (
      typeof p.id !== "string" ||
      typeof p.name !== "string" ||
      typeof p.brand !== "string" ||
      typeof p.purchaseDate !== "string" ||
      typeof p.warrantyEndDate !== "string" ||
      typeof p.returnDeadline !== "string"
    ) {
      continue;
    }
    result.push({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category ?? "Diğer",
      store: p.store ?? "—",
      price: typeof p.price === "number" ? p.price : 0,
      purchaseDate: p.purchaseDate,
      warrantyEndDate: p.warrantyEndDate,
      returnDeadline: p.returnDeadline,
      invoiceNumber: p.invoiceNumber,
      trackingNumber: p.trackingNumber,
      status: p.status ?? "active",
      notes: p.notes,
      documents: Array.isArray(p.documents) ? p.documents : [],
      serviceRecords: Array.isArray(p.serviceRecords) ? p.serviceRecords : [],
      returnProcess: p.returnProcess,
    });
  }
  return result;
}

function sanitizeSettings(input: unknown, base: AppSettings): AppSettings {
  if (!isObject(input)) return base;
  const s = input as Partial<AppSettings>;
  return {
    profileName: typeof s.profileName === "string" ? s.profileName : base.profileName,
    notificationsEnabled:
      typeof s.notificationsEnabled === "boolean"
        ? s.notificationsEnabled
        : base.notificationsEnabled,
    warrantyWarnDays:
      typeof s.warrantyWarnDays === "number" && s.warrantyWarnDays >= 0
        ? s.warrantyWarnDays
        : base.warrantyWarnDays,
    returnWarnDays:
      typeof s.returnWarnDays === "number" && s.returnWarnDays >= 0
        ? s.returnWarnDays
        : base.returnWarnDays,
    theme: s.theme === "system" ? "system" : "light",
  };
}

interface StoreValue {
  hydrated: boolean;
  products: Product[];
  settings: AppSettings;
  addProduct: (
    input: Omit<Product, "id" | "status" | "documents" | "serviceRecords">,
  ) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addDocument: (productId: string, doc: Omit<AldimDocument, "id" | "productId">) => void;
  addServiceRecord: (
    productId: string,
    record: Omit<ServiceRecord, "id" | "productId">,
  ) => void;
  startReturn: (productId: string, data: Omit<ReturnProcess, "id" | "productId">) => void;
  updateReturn: (productId: string, patch: Partial<ReturnProcess>) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetToDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function recomputeStatuses(products: Product[], warnDays: number): Product[] {
  return products.map((p) => ({
    ...p,
    status: computeProductStatus(p, warnDays),
  }));
}

function loadPersisted(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) return null;
    const products = sanitizeProducts(parsed.products);
    const settings = sanitizeSettings(parsed.settings, DEFAULT_SETTINGS);
    return { products, settings };
  } catch {
    return null;
  }
}

function persist(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessiz geç — quota / private mode
  }
}

export function AldimStoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // İlk yüklemede localStorage'dan oku, yoksa demo verisi kullan.
  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) {
      setProducts(
        recomputeStatuses(persisted.products, persisted.settings.warrantyWarnDays),
      );
      setSettings(persisted.settings);
    } else {
      setProducts(recomputeStatuses(MOCK_PRODUCTS, DEFAULT_SETTINGS.warrantyWarnDays));
    }
    setHydrated(true);
  }, []);

  // Değişiklikleri kaydet (yalnızca hydrate sonrası).
  useEffect(() => {
    if (!hydrated) return;
    persist({ products, settings });
  }, [hydrated, products, settings]);

  const addProduct = useCallback<StoreValue["addProduct"]>(
    (input) => {
      const newProduct: Product = {
        ...input,
        id: uid("p"),
        documents: [],
        serviceRecords: [],
        status: "active",
      };
      newProduct.status = computeProductStatus(newProduct, settings.warrantyWarnDays);
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    },
    [settings.warrantyWarnDays],
  );

  const updateProduct = useCallback<StoreValue["updateProduct"]>(
    (id, patch) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const next = { ...p, ...patch };
          next.status = computeProductStatus(next, settings.warrantyWarnDays);
          return next;
        }),
      );
    },
    [settings.warrantyWarnDays],
  );

  const deleteProduct = useCallback<StoreValue["deleteProduct"]>((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addDocument = useCallback<StoreValue["addDocument"]>(
    (productId, doc) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                documents: [
                  ...p.documents,
                  { ...doc, id: uid("d"), productId },
                ],
              }
            : p,
        ),
      );
    },
    [],
  );

  const addServiceRecord = useCallback<StoreValue["addServiceRecord"]>(
    (productId, record) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const next: Product = {
            ...p,
            serviceRecords: [
              ...p.serviceRecords,
              { ...record, id: uid("s"), productId },
            ],
          };
          next.status = computeProductStatus(next, settings.warrantyWarnDays);
          return next;
        }),
      );
    },
    [settings.warrantyWarnDays],
  );

  const startReturn = useCallback<StoreValue["startReturn"]>(
    (productId, data) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const next: Product = {
            ...p,
            returnProcess: { ...data, id: uid("r"), productId },
          };
          next.status = computeProductStatus(next, settings.warrantyWarnDays);
          return next;
        }),
      );
    },
    [settings.warrantyWarnDays],
  );

  const updateReturn = useCallback<StoreValue["updateReturn"]>(
    (productId, patch) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId || !p.returnProcess) return p;
          const next: Product = {
            ...p,
            returnProcess: { ...p.returnProcess, ...patch },
          };
          next.status = computeProductStatus(next, settings.warrantyWarnDays);
          return next;
        }),
      );
    },
    [settings.warrantyWarnDays],
  );

  const updateSettings = useCallback<StoreValue["updateSettings"]>(
    (patch) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        setProducts((curProducts) =>
          recomputeStatuses(curProducts, next.warrantyWarnDays),
        );
        return next;
      });
    },
    [],
  );

  const resetToDemo = useCallback(() => {
    setProducts(recomputeStatuses(MOCK_PRODUCTS, DEFAULT_SETTINGS.warrantyWarnDays));
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      hydrated,
      products,
      settings,
      addProduct,
      updateProduct,
      deleteProduct,
      addDocument,
      addServiceRecord,
      startReturn,
      updateReturn,
      updateSettings,
      resetToDemo,
    }),
    [
      hydrated,
      products,
      settings,
      addProduct,
      updateProduct,
      deleteProduct,
      addDocument,
      addServiceRecord,
      startReturn,
      updateReturn,
      updateSettings,
      resetToDemo,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAldimStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useAldimStore must be used within AldimStoreProvider");
  }
  return ctx;
}
