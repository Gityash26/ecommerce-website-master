import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/data/products";
import { supabase } from "./supabase"; 

export type CartItem = { product: Product; qty: number; size?: string; color?: string };

type ShopState = {
  products: Product[]; 
  cart: CartItem[];
  wishlist: number[];
  user: { email: string } | null;
  theme: "light" | "dark";
  addToCart: (p: Product, opts?: { size?: string; color?: string; qty?: number }) => void;
  updateQty: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => void;
  setUser: (u: { email: string } | null) => void;
  logout: () => Promise<void>;
  placeOrder: () => Promise<{ success?: boolean; error?: string }>;
  toggleTheme: () => void;
  cartCount: number;
  subtotal: number;
};

const ShopCtx = createContext<ShopState | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hydrated, setHydrated] = useState(false);

  // 1. Fetch Products
  useEffect(() => {
    async function getProducts() {
      const { data } = await supabase.from("products").select("*");
      if (data) {
        const mapped = data.map((p) => ({
          ...p,
          rating: { rate: p.rating_rate, count: p.rating_count },
        }));
        setProducts(mapped);
      }
    }
    getProducts();
  }, []);

  // 2. Hydration
  useEffect(() => {
    setCart(read("cart", []));
    setWishlist(read("wishlist", []));
    setUser(read("user", null));
    const t = read<"light" | "dark">("theme", "light");
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    setHydrated(true);
  }, []);

  // 3. Sync to LocalStorage
  useEffect(() => { if (hydrated) localStorage.setItem("cart", JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("wishlist", JSON.stringify(wishlist)); }, [wishlist, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("user", JSON.stringify(user)); }, [user, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, hydrated]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("user");
  };

  // --- CALCULATE TOTALS FIRST ---
  const subtotalValue = cart.reduce((n, x) => n + x.product.price * x.qty, 0);
  const cartCountValue = cart.reduce((n, x) => n + x.qty, 0);

  // --- PLACE ORDER LOGIC ---
  const placeOrder = async () => {
    if (!user || cart.length === 0) return { error: "Login required or cart empty" };

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return { error: "Session expired" };

    // Use subtotalValue calculated above
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{ user_id: authUser.id, total_amount: subtotalValue }])
      .select()
      .single();

    if (orderError) return { error: orderError.message };

    const itemsToInsert = cart.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.qty,
      price_at_purchase: item.product.price,
      size: item.size,
      color: item.color
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);

    if (itemsError) return { error: itemsError.message };

    setCart([]); 
    return { success: true };
  };

  const value = useMemo<ShopState>(() => ({
    products, cart, wishlist, user, theme,
    addToCart: (p, opts) => setCart((c) => {
      const i = c.findIndex((x) => x.product.id === p.id && x.size === opts?.size && x.color === opts?.color);
      if (i >= 0) { const next = [...c]; next[i] = { ...next[i], qty: next[i].qty + (opts?.qty ?? 1) }; return next; }
      return [...c, { product: p, qty: opts?.qty ?? 1, size: opts?.size, color: opts?.color }];
    }),
    updateQty: (id, qty) => setCart((c) => c.map((x) => x.product.id === id ? { ...x, qty: Math.max(1, qty) } : x)),
    removeFromCart: (id) => setCart((c) => c.filter((x) => x.product.id !== id)),
    clearCart: () => setCart([]),
    toggleWishlist: (id) => setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]),
    setUser,
    logout,
    placeOrder, 
    toggleTheme: () => setTheme((t) => t === "light" ? "dark" : "light"),
    cartCount: cartCountValue,
    subtotal: subtotalValue,
  }), [products, cart, wishlist, user, theme, subtotalValue, cartCountValue]);

  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopCtx);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);