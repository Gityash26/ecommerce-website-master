import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CreditCard, Smartphone, Wallet, Check, Lock, Loader2, MapPin, Search, Navigation } from "lucide-react";
import { useShop, formatPrice } from "@/lib/store";

// Map Imports - Ensure you add Leaflet CSS to your index.html
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25,41], iconAnchor: [12,41] });
L.Marker.prototype.options.icon = DefaultIcon;

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
  const { cart, subtotal, placeOrder, user } = useShop();
  const navigate = useNavigate();
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: user?.email || "",
    address: "", city: "", postalCode: "", country: "India"
  });
  const [method, setMethod] = useState("card");
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- MAP & LOCATION STATE ---
  const [mapPos, setMapPos] = useState<[number, number]>([28.6139, 77.2090]); // Default: Delhi
  const [mapOpen, setMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tax = subtotal * 0.08;
  const shipping = subtotal > 200 ? 0 : 25;
  const total = subtotal + tax + shipping;

  // Helper: Reverse Geocode Lat/Lng to Address
  const fetchAddressFromCoords = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data.address) {
        setFormData(prev => ({
          ...prev,
          address: data.display_name,
          city: data.address.city || data.address.town || data.address.village || "",
          postalCode: data.address.postcode || ""
        }));
      }
    } catch (err) { console.error("Geocoding failed", err); }
  };

  // Action: Get Current Device Location
  const handleGeoLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported by browser.");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setMapPos([latitude, longitude]);
      setMapOpen(true);
      await fetchAddressFromCoords(latitude, longitude);
    });
  };

  // Action: Search Address on Map
  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setMapPos([parseFloat(lat), parseFloat(lon)]);
        setMapOpen(true);
        await fetchAddressFromCoords(parseFloat(lat), parseFloat(lon));
      }
    } catch (err) { alert("Location not found."); }
  };

  // Map Component: Update view when pos changes
  function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center, 16);
    return null;
  }

  // Map Component: Handle manual clicks
  function MapEvents() {
    useMapEvents({
      click(e) {
        setMapPos([e.latlng.lat, e.latlng.lng]);
        fetchAddressFromCoords(e.latlng.lat, e.latlng.lng);
      },
    });
    return <Marker position={mapPos} />;
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate({ to: "/login" });
    setIsProcessing(true);
    const result = await placeOrder();
    if (result.success) setSuccess(true);
    setIsProcessing(false);
  };

  if (cart.length === 0 && !success) return <EmptyBag />;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
      <h1 className="font-display text-5xl font-light sm:text-6xl">Checkout</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px]">
        <form onSubmit={handlePay} className="space-y-12">
          
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Shipping address</h2>
              <button 
                type="button" 
                onClick={handleGeoLocation}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold hover:opacity-70 transition"
              >
                <Navigation className="h-3 w-3" /> Detect Location
              </button>
            </div>

            {/* Address Fields */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="First name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              <Field label="Last name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              <Field label="Address" className="sm:col-span-2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <Field label="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              <Field label="Postal code" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} />
            </div>

            {/* Interactive Map Interface */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-muted/30">
              <div className="flex items-center gap-2 bg-background p-3 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleMapSearch(e)}
                  placeholder="Search for a building or street..." 
                  className="flex-1 bg-transparent text-xs outline-none"
                />
                <button type="button" onClick={handleMapSearch} className="text-[10px] font-bold uppercase tracking-widest px-3">Find</button>
              </div>
              
              <div className="h-[300px] w-full z-0 cursor-crosshair">
                <MapContainer center={mapPos} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapUpdater center={mapPos} />
                  <MapEvents />
                </MapContainer>
              </div>
              <div className="bg-background p-2 text-center border-t border-border">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Click the map to adjust exact pin location</p>
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section>
            <h2 className="font-display text-2xl">Payment</h2>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {METHODS.map((m) => (
                <button type="button" key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${method === m.id ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40"}`}>
                  <m.Icon className="h-5 w-5" /><span className="text-xs font-medium">{m.label}</span>
                </button>
              ))}
            </div>
            {/* Payment Details Form (Hidden for brevity, same as your original) */}
          </section>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-sm font-medium text-gold-foreground shadow-gold transition hover:scale-[1.01] disabled:opacity-70"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {isProcessing ? "Finalizing Order..." : `Complete Purchase — ${formatPrice(total)}`}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-card p-8 shadow-soft lg:sticky lg:top-28">
           {/* Summary Section (Same as your original) */}
        </aside>
      </div>

      <SuccessOverlay visible={success} />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Field({ label, className, ...rest }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input {...rest} required className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20" />
    </label>
  );
}

function EmptyBag() {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Your bag is empty</h1>
      <Link to="/shop" className="story-link mt-6 inline-block">Browse the collection</Link>
    </div>
  );
}

function SuccessOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 backdrop-blur-md p-6">
      {/* ... Animated Success Content ... */}
    </motion.div>
  );
}