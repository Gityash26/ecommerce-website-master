import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, lazy, Suspense } from "react";
import { Smartphone, Wallet, Check, Lock, Loader2, Navigation, ShoppingBag, X } from "lucide-react";
import { useShop, formatPrice } from "@/lib/store";
import { QRCodeSVG } from "qrcode.react";

const MapInterface = lazy(() => import("@/components/shop/MapInterface"));

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Maison Or" }] }),
  component: Checkout,
});

const METHODS = [
  { id: "upi", label: "UPI Pay", Icon: Smartphone, description: "Scan to Pay Instantly" },
  { id: "cod", label: "Cash on Delivery", Icon: Wallet, description: "Pay when you receive" },
];

function Checkout() {
  const { cart, subtotal, placeOrder, user } = useShop();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "Guest",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [method, setMethod] = useState("upi");
  const [isBrowser, setIsBrowser] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mapPos, setMapPos] = useState<[number, number]>([28.6139, 77.2090]);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const total = subtotal + subtotal * 0.08 + (subtotal > 200 ? 0 : 25);

  const handleAutoLocate = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setMapPos([latitude, longitude]);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`);
        const data: any = await res.json();
        const addr = data.address;
        setFormData((prev) => ({
          ...prev,
          address: [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(", ") || data.display_name.split(",").slice(0, 2).join(", "),
          city: addr.city || addr.town || addr.village || "",
          postalCode: addr.postcode || "",
        }));
      } catch (e) { console.error(e); }
    });
  };

  const handlePay = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return navigate({ to: "/login" });
    if (!formData.address) return alert("Please select a delivery location.");

    // Trigger QR Modal if UPI is selected and not already shown
    if (method === 'upi' && !showQR) {
      setShowQR(true);
      return;
    }

    setIsProcessing(true);
    // Matching store.tsx signature (0 arguments)
    const result = await placeOrder();

    if (result.success) {
      setShowQR(false);
      setSuccess(true);
      setTimeout(() => navigate({ to: "/" }), 5000);
    } else {
      alert(result.error || "Order failed.");
    }
    setIsProcessing(false);
  };

  if (cart.length === 0 && !success) return <EmptyBag />;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24 font-sans">
      <h1 className="font-display text-5xl font-light sm:text-6xl text-foreground mb-12">Checkout</h1>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <form onSubmit={handlePay} className="space-y-12">
          
          <section className="opacity-80">
            <h2 className="font-display text-2xl text-foreground mb-6 underline decoration-gold/30 underline-offset-8">Contact Info</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" value={`${formData.firstName} ${formData.lastName}`} readOnly className="bg-muted/10 cursor-not-allowed" />
              <Field label="Email Address" value={formData.email} readOnly className="bg-muted/10 cursor-not-allowed" />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl text-foreground">Delivery Address</h2>
              <button type="button" onClick={handleAutoLocate} className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-all shadow-lg">
                <Navigation className="h-3 w-3" /> Auto-Locate
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              <Field label="Full Address" value={formData.address} className="sm:col-span-2" onChange={(e: any) => setFormData({ ...formData, address: e.target.value })} />
              <Field label="City" value={formData.city} readOnly className="bg-muted/5" />
              <Field label="Postal Code" value={formData.postalCode} readOnly className="bg-muted/5" />
            </div>

            <div className="h-[450px] rounded-[2.5rem] border border-border/40 overflow-hidden bg-[#121212] relative shadow-2xl ring-1 ring-white/5">
              {isBrowser ? (
                <Suspense fallback={<div className="flex h-full items-center justify-center text-[10px] uppercase animate-pulse text-muted-foreground">Loading Satellite Data...</div>}>
                  <MapInterface pos={mapPos} setPos={setMapPos} onAddressSelect={(data) => setFormData((prev) => ({ ...prev, ...data }))} />
                </Suspense>
              ) : <div className="h-full w-full bg-[#121212]" />}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-6">Payment Choice</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {METHODS.map((m) => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)} className={`flex items-start gap-4 rounded-2xl border p-5 transition-all text-left ${method === m.id ? "border-gold bg-gold/5 ring-1 ring-gold" : "border-border hover:border-gold/30"}`}>
                  <div className={`p-2 rounded-lg ${method === m.id ? "bg-gold text-white" : "bg-muted text-muted-foreground"}`}><m.Icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{m.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <button type="submit" disabled={isProcessing} className="group w-full bg-foreground text-background py-6 rounded-full font-bold shadow-elegant hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Lock className="h-4 w-4" /><span className="uppercase tracking-[0.2em] text-[11px]">{method === "upi" ? "Generate UPI QR" : "Place COD Order"} — {formatPrice(total)}</span></>}
          </button>
        </form>

        <aside className="h-fit rounded-3xl border border-border/40 bg-card/50 p-8 shadow-soft backdrop-blur-xl lg:sticky lg:top-28">
          <h3 className="font-display text-2xl mb-6 text-foreground">Bag Summary</h3>
          <ul className="space-y-4 mb-6">
            {cart.map((it) => (
              <li key={it.product.id} className="flex gap-3 text-sm">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img src={it.product.image} alt="" className="h-full w-full object-cover" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background font-bold">{it.qty}</span>
                </div>
                <div className="flex-1 font-medium text-foreground">{it.product.title}</div>
                <div className="tabular-nums font-medium text-foreground">{formatPrice(it.product.price * it.qty)}</div>
              </li>
            ))}
          </ul>
          <div className="border-t border-border/40 pt-4 flex justify-between font-medium text-xl text-foreground"><span className="font-display">Total Due</span><span>{formatPrice(total)}</span></div>
        </aside>
      </div>

      {/* UPI QR MODAL */}
      <AnimatePresence>
        {showQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-card border border-border p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl relative">
              <button onClick={() => setShowQR(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              <div className="mb-6 flex justify-center mt-4">
                <div className="p-4 bg-white rounded-3xl"><QRCodeSVG value={`upi://pay?pa=maisonor@bank&pn=MaisonOr&am=${total}&cu=INR`} size={180} level="H" /></div>
              </div>
              <h3 className="font-display text-2xl mb-2 text-foreground font-light">Scan to Pay</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-8">Secure payment via UPI Intent</p>
              <button onClick={() => handlePay()} className="w-full bg-gold text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">I Have Paid</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessOverlay visible={success} />
    </div>
  );
}

function Field({ label, className, ...rest }: any) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 mb-2 block">{label}</span>
      <input {...rest} className="w-full rounded-xl border border-border bg-background/50 px-5 py-4 text-sm outline-none focus:border-gold transition-all text-foreground" />
    </label>
  );
}

function EmptyBag() {
  return (
    <div className="mx-auto max-w-xl px-6 py-40 text-center">
      <ShoppingBag className="h-12 w-12 mx-auto text-muted mb-6" />
      <h1 className="font-display text-4xl mb-4 text-foreground">Your bag is empty</h1>
      <Link to="/shop" className="text-gold uppercase text-xs font-bold tracking-widest hover:underline">Return to Collection</Link>
    </div>
  );
}

function SuccessOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[120] flex items-center justify-center bg-background/95 backdrop-blur-xl p-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto h-24 w-24 rounded-full bg-gold shadow-gold flex items-center justify-center mb-8 animate-bounce">
          <Check className="h-12 w-12 text-white" />
        </div>
        <h2 className="font-display text-5xl mb-4 text-foreground font-light italic">Exquisite choice.</h2>
        <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Order placed successfully. Returning home in a moment...</p>
      </div>
    </motion.div>
  );
}