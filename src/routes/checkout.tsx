import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CreditCard, Smartphone, Wallet, Check, Lock, Loader2 } from "lucide-react";
import { useShop, formatPrice } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Maison Or" }] }),
  component: Checkout,
});

const METHODS = [
  { id: "card", label: "Credit Card", Icon: CreditCard },
  { id: "upi", label: "UPI", Icon: Smartphone },
  { id: "wallet", label: "Wallet", Icon: Wallet },
];

function Checkout() {
  // 1. Pull placeOrder from useShop
  const { cart, subtotal, placeOrder, user } = useShop();
  const navigate = useNavigate();
  const [method, setMethod] = useState("card");
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New loading state

  const tax = subtotal * 0.08;
  const shipping = subtotal > 200 ? 0 : 25;
  const total = subtotal + tax + shipping;

  if (cart.length === 0 && !success) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
        <Link to="/shop" className="story-link mt-6 inline-block">Browse the collection</Link>
      </div>
    );
  }

  // 2. Updated handlePay to be async and call the database
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to complete your purchase.");
      navigate({ to: "/login" });
      return;
    }

    setIsProcessing(true);

    try {
      // Call the placeOrder function from store.tsx
      const result = await placeOrder();

      if (result.success) {
        setSuccess(true);
        // Navigate home after a short delay to show the animation
        setTimeout(() => navigate({ to: "/" }), 5000);
      } else {
        alert(result.error || "Payment failed. Please try again.");
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
      <h1 className="font-display text-5xl font-light sm:text-6xl">Checkout</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px]">
        <form onSubmit={handlePay} className="space-y-12">
          {/* Shipping section remains the same */}
          <section>
            <h2 className="font-display text-2xl">Shipping address</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="First name" />
              <Field label="Last name" />
              <Field label="Email" type="email" className="sm:col-span-2" />
              <Field label="Address" className="sm:col-span-2" />
              <Field label="City" />
              <Field label="Postal code" />
              <Field label="Country" defaultValue="" className="sm:col-span-2" />
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">Payment</h2>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {METHODS.map((m) => (
                <button type="button" key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${method === m.id ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40"}`}>
                  <m.Icon className="h-5 w-5" /><span className="text-xs font-medium">{m.label}</span>
                </button>
              ))}
            </div>
            {/* Payment Method Details remain the same */}
            <AnimatePresence mode="wait">
              <motion.div key={method} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="mt-6 grid gap-4 sm:grid-cols-2">
                {method === "card" && <>
                  <Field label="Card number" placeholder="•••• •••• •••• ••••" className="sm:col-span-2" />
                  <Field label="Name on card" />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry" placeholder="MM/YY" />
                    <Field label="CVC" placeholder="•••" />
                  </div>
                </>}
                {method === "upi" && <Field label="UPI ID" placeholder="yourname@bank" className="sm:col-span-2" />}
                {method === "wallet" && <div className="sm:col-span-2 rounded-xl border border-border bg-muted p-6 text-sm text-muted-foreground">You will be redirected to your wallet provider after confirming.</div>}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* 3. Updated Button to handle loading state */}
          <button 
            type="submit" 
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-sm font-medium text-gold-foreground shadow-gold transition hover:scale-[1.01] disabled:opacity-70"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {isProcessing ? "Processing Transaction..." : `Pay ${formatPrice(total)}`}
          </button>
        </form>

        {/* Aside Summary remains the same */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-8 shadow-soft lg:sticky lg:top-28">
          <h3 className="font-display text-2xl">Summary</h3>
          <ul className="mt-6 space-y-4">
            {cart.map((it) => (
              <li key={it.product.id} className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img src={it.product.image} alt="" className="h-full w-full object-cover" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">{it.qty}</span>
                </div>
                <div className="flex-1 text-sm"><div className="font-medium">{it.product.title}</div><div className="text-xs text-muted-foreground">{[it.color, it.size].filter(Boolean).join(" · ")}</div></div>
                <div className="text-sm tabular-nums">{formatPrice(it.product.price * it.qty)}</div>
              </li>
            ))}
          </ul>
          <div className="my-6 h-px bg-border" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd className="tabular-nums">{formatPrice(tax)}</dd></div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base"><dt className="font-medium">Total</dt><dd className="font-display text-xl tabular-nums">{formatPrice(total)}</dd></div>
          </dl>
        </aside>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: [0.2,0.8,0.2,1] }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", damping: 12 }} className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gold-gradient shadow-gold">
                <Check className="h-12 w-12 text-gold-foreground" strokeWidth={3} />
              </motion.div>
              <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 font-display text-5xl font-light">Thank you</motion.h2>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.85 }} className="mt-4 max-w-md text-muted-foreground">Your order is on its way. A confirmation has been sent to your inbox.</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">Returning to home…</motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, className, ...rest }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input {...rest} required className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20" />
    </label>
  );
}