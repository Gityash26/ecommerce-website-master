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
  { id: "upi", label: "UPI Pay", Icon: Smartphone, description: "Instant QR Payment" },
  { id: "cod", label: "Cash on Delivery", Icon: Wallet, description: "Pay on Arrival" },
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
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mapPos, setMapPos] = useState<[number, number]>([28.6139, 77.2090]);

  useEffect(() => { setIsBrowser(true); }, []);

  const total = subtotal + subtotal * 0.08 + (subtotal > 200 ? 0 : 25);

  const handleMethodSelect = (id: string) => {
    setMethod(id);
    if (formData.address) setIsMapCollapsed(true);
  };

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
    if (!formData.address) return alert("Select a delivery pin first.");

    if (method === 'upi' && !showQR) {
      setShowQR(true);
      setIsMapCollapsed(true); // Forced collapse for cleaner pay view
      return;
    }

    setIsProcessing(true);
    const result = await placeOrder();
    if (result.success) {
      setShowQR(false);
      setSuccess(true);
      setTimeout(() => navigate({ to: "/" }), 4000);
    }
    setIsProcessing(false);
  };

  if (cart.length === 0 && !success) return <EmptyBag />;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24 font-sans text-foreground">
      <h1 className="font-display text-5xl font-light sm:text-7xl mb-16 italic tracking-tight">Checkout.</h1>

      <div className="grid gap-16 lg:grid-cols-[1fr_420px]">
        <form onSubmit={handlePay} className="space-y-16">
          
          <section className="opacity-60 hover:opacity-100 transition-opacity duration-700">
            <h2 className="font-display text-xl mb-8 uppercase tracking-[0.3em] text-gold">I. Identity</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Client Name" value={`${formData.firstName} ${formData.lastName}`} readOnly className="bg-muted/5 cursor-not-allowed border-none shadow-inner" />
              <Field label="Email" value={formData.email} readOnly className="bg-muted/5 cursor-not-allowed border-none shadow-inner" />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl uppercase tracking-[0.3em] text-gold">II. Logistics</h2>
              <div className="flex gap-4">
                <button type="button" onClick={handleAutoLocate} className="flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-all shadow-xl shadow-gold/10">
                  <Navigation className="h-3 w-3" /> Pin Current
                </button>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 mb-8">
              <Field label="Street / Sector" value={formData.address} className="sm:col-span-2" onChange={(e: any) => setFormData({ ...formData, address: e.target.value })} />
              <Field label="City" value={formData.city} readOnly className="bg-muted/5" />
              <Field label="ZIP" value={formData.postalCode} readOnly className="bg-muted/5" />
            </div>

            <motion.div animate={{ height: isMapCollapsed ? "100px" : "480px" }} className="rounded-[3rem] border border-border/40 overflow-hidden bg-[#0a0a0a] relative shadow-2xl z-0 ring-1 ring-white/5">
              <AnimatePresence mode="wait">
                {isMapCollapsed ? (
                  <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center px-10 gap-6 cursor-pointer" onClick={() => setIsMapCollapsed(false)}>
                    <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20"><Check className="h-6 w-6 text-gold" /></div>
                    <div className="truncate"><p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold mb-1">Destination Locked</p><p className="text-sm opacity-60 italic truncate max-w-md">{formData.address}</p></div>
                  </motion.div>
                ) : (
                  <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full">
                    {isBrowser && <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gold" /></div>}><MapInterface pos={mapPos} setPos={setMapPos} onAddressSelect={(data) => setFormData(p => ({...p, ...data}))} /></Suspense>}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </section>

          <section>
            <h2 className="font-display text-xl mb-8 uppercase tracking-[0.3em] text-gold">III. Payment</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {METHODS.map((m) => (
                <button key={m.id} type="button" onClick={() => handleMethodSelect(m.id)} className={`flex items-start gap-5 rounded-[2.5rem] border p-7 transition-all ${method === m.id ? "border-gold bg-gold/5 ring-2 ring-gold/20 shadow-2xl shadow-gold/10" : "border-border hover:border-gold/20"}`}>
                  <div className={`p-4 rounded-2xl ${method === m.id ? "bg-gold text-white" : "bg-muted"}`}><m.Icon className="h-6 w-6" /></div>
                  <div className="text-left"><p className="text-sm font-bold tracking-tight">{m.label}</p><p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-2 leading-relaxed">{m.description}</p></div>
                </button>
              ))}
            </div>
          </section>

          <button type="submit" disabled={isProcessing} className="w-full bg-foreground text-background py-8 rounded-full font-bold shadow-2xl hover:brightness-125 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4">
            {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Lock className="h-5 w-5" /><span className="uppercase tracking-[0.3em] text-[11px]">{method === "upi" ? "Initialize UPI Gateway" : "Confirm COD Reserve"}</span></>}
          </button>
        </form>

        <aside className="h-fit rounded-[3rem] border border-border/40 bg-card/30 p-10 backdrop-blur-3xl lg:sticky lg:top-28 shadow-soft">
          <h3 className="font-display text-3xl mb-10 italic">Summary</h3>
          <div className="space-y-8">
            {cart.map((it) => (
              <div key={it.product.id} className="flex gap-5 items-center">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-muted"><img src={it.product.image} className="h-full w-full object-cover" /><span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[10px] text-white font-bold">{it.qty}</span></div>
                <div className="flex-1 text-sm"><div className="font-medium truncate max-w-[160px]">{it.product.title}</div><div className="text-[10px] uppercase text-muted-foreground mt-1">{it.color}</div></div>
                <div className="tabular-nums font-medium text-gold">{formatPrice(it.product.price * it.qty)}</div>
              </div>
            ))}
            <div className="pt-8 border-t border-white/10 flex justify-between font-display text-3xl italic"><span>Total</span><span className="text-gold">{formatPrice(total)}</span></div>
          </div>
        </aside>
      </div>

      {/* FIXED UPI QR MODAL - HIGHER Z-INDEX */}
      <AnimatePresence>
        {showQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-6">
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-[#121212] border border-white/10 p-12 rounded-[4rem] max-w-sm w-full text-center shadow-[0_0_100px_rgba(212,175,55,0.15)] relative">
              <button onClick={() => setShowQR(false)} className="absolute top-10 right-10 text-muted-foreground hover:text-white transition-colors"><X className="h-6 w-6" /></button>
              <div className="mb-10 flex justify-center"><div className="p-7 bg-white rounded-[3.5rem] shadow-[0_0_40px_rgba(255,255,255,0.1)]"><QRCodeSVG value={`upi://pay?pa=maisonor@bank&pn=MaisonOr&am=${total}&cu=INR`} size={190} level="H" /></div></div>
              <h3 className="font-display text-4xl mb-3 font-light italic text-white">Scan & Pay</h3>
              <p className="text-[9px] text-gold uppercase tracking-[0.5em] mb-12 opacity-80">Maison Or Concierge</p>
              <button onClick={() => handlePay()} className="w-full bg-gold text-white py-6 rounded-full font-bold text-xs uppercase tracking-[0.25em] shadow-gold/20 hover:brightness-110 active:scale-95 transition-all">I Have Paid</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FINAL SUCCESS OVERLAY */}
      <SuccessOverlay visible={success} />
    </div>
  );
}

function Field({ label, className, ...rest }: any) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground ml-2 mb-3 block">{label}</span>
      <input {...rest} className="w-full rounded-3xl border border-border/40 bg-background/20 px-8 py-5 text-sm outline-none focus:border-gold transition-all" />
    </label>
  );
}

function EmptyBag() { return <div className="text-center py-60"><h1 className="font-display text-6xl italic opacity-20 mb-12">The bag is empty.</h1><Link to="/shop" className="bg-gold text-white px-14 py-5 rounded-full text-[11px] uppercase font-bold tracking-[0.3em] hover:scale-105 transition-transform shadow-2xl">Return to Showroom</Link></div>; }

function SuccessOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 backdrop-blur-[60px] p-6 text-center">
      <div className="max-w-xl">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }} className="mx-auto h-32 w-32 rounded-full bg-gold shadow-[0_0_60px_rgba(212,175,55,0.4)] flex items-center justify-center mb-12 border-[10px] border-white/10"><Check className="h-16 w-16 text-white" /></motion.div>
        <h2 className="font-display text-7xl mb-8 italic font-light text-white">Exquisite Choice.</h2>
        <p className="text-gold/60 text-[11px] uppercase tracking-[0.6em] leading-loose">Your acquisition has been finalized. We are preparing the shipment for its journey.</p>
      </div>
    </motion.div>
  );
}