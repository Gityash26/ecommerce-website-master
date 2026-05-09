import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useShop, formatPrice } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Bag — Maison Or" }] }),
  component: CartPage,
});

function CartPage() {
  const { cart, updateQty, removeFromCart, subtotal, cartCount } = useShop();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full bg-accent p-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-display text-4xl mb-4">Your bag is empty</h1>
        <p className="mb-8 max-w-xs text-muted-foreground">
          Discover our curated collection of luxury objects to find your next piece.
        </p>
        <Link to="/shop" className="story-link inline-block">
          Explore the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="flex items-end justify-between border-b border-border pb-8">
        <h1 className="font-display text-5xl font-light sm:text-6xl">Your Bag</h1>
        <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
          {cartCount} {cartCount === 1 ? "Item" : "Items"}
        </p>
      </div>

      <div className="mt-12 grid gap-16 lg:grid-cols-[1fr_380px]">
        {/* CART ITEMS LIST */}
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.size}-${item.color}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-6 border-b border-border/50 pb-8 last:border-0"
              >
                <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-40 sm:w-32">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between gap-4">
                      <h3 className="font-display text-xl font-medium sm:text-2xl">
                        {item.product.title}
                      </h3>
                      <p className="font-medium tabular-nums">{formatPrice(item.product.price)}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground capitalize">
                      {[item.product.category, item.color, item.size].filter(Boolean).join(" · ")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
                      <button
                        onClick={() => updateQty(item.product.id, item.qty - 1)}
                        className="rounded-full p-1.5 transition hover:bg-accent disabled:opacity-30"
                        disabled={item.qty <= 1}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.product.id, item.qty + 1)}
                        className="rounded-full p-1.5 transition hover:bg-accent"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ORDER SUMMARY */}
        <aside className="h-fit space-y-8 rounded-3xl border border-border bg-card p-8 shadow-soft lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-medium">Order Summary</h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                Complimentary
              </span>
            </div>
            <div className="border-t border-border pt-4 text-base">
              <div className="flex justify-between items-end">
                <span className="font-medium">Total</span>
                <span className="font-display text-3xl font-bold tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground italic">
                Local taxes calculated at checkout.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate({ to: "/checkout" })}
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-foreground py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-background transition hover:opacity-90 shadow-elegant"
          >
            Secure Checkout
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="flex items-center justify-center gap-4 border-t border-border pt-6 grayscale opacity-50">
            <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
              Accepted Payments
            </div>
            {/* Visual placeholders for payment icons */}
            <div className="flex gap-2">
              <div className="h-4 w-6 rounded-sm bg-muted-foreground/20" />
              <div className="h-4 w-6 rounded-sm bg-muted-foreground/20" />
              <div className="h-4 w-6 rounded-sm bg-muted-foreground/20" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
