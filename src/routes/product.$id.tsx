import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Star, Heart, Check, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { useShop, formatPrice } from "@/lib/store";
import { ProductCard } from "@/components/shop/ProductCard";

export const Route = createFileRoute("/product/$id")({
  // We keep the head metadata, but we'll handle the data inside the component
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { products, addToCart, wishlist, toggleWishlist } = useShop();
  
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [added, setAdded] = useState(false);
  const [size, setSize] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();

  // 1. Find the product from the live database state
  const product = useMemo(() => {
    return products.find((p) => String(p.id) === id);
  }, [products, id]);

  // 2. Find related items from the live database state
  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  // Handle Loading/Not Found states
  if (products.length === 0) return <div className="py-40 text-center animate-pulse">Loading object details...</div>;
  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl">Object not found</h1>
        <Link to="/shop" className="story-link mt-6 inline-block">Browse the collection</Link>
      </div>
    );
  }

  const gallery = [product.image, ...related.slice(0, 3).map((p) => p.image)];
  const liked = wishlist.includes(product.id);

  const handleAdd = () => {
    addToCart(product, { size, color });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
      <nav className="mb-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/shop" className="hover:text-foreground">Shop</Link> / <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <motion.div
            layout
            onClick={() => setZoom((z) => !z)}
            className={`relative overflow-hidden rounded-2xl bg-muted shadow-soft cursor-zoom-in ${zoom ? "cursor-zoom-out" : ""}`}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={gallery[active]}
                alt={product.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: zoom ? 1.5 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                className="aspect-[4/5] w-full object-cover"
              />
            </AnimatePresence>
          </motion.div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {gallery.map((src, i) => (
              <button key={i} onClick={() => setActive(i)} className={`aspect-square overflow-hidden rounded-lg transition ${active === i ? "ring-2 ring-gold" : "opacity-70 hover:opacity-100"}`}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{product.category}</p>
          <h1 className="mt-3 font-display text-4xl font-light leading-tight sm:text-5xl">{product.title}</h1>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1 text-gold">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating.rate) ? "fill-current" : ""}`} />)}
            </div>
            <span className="text-sm text-muted-foreground">{product.rating.rate} · {product.rating.count} reviews</span>
          </div>
          <p className="mt-6 text-3xl font-display tabular-nums">{formatPrice(product.price)}</p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Color · <span className="text-foreground">{color || "Select"}</span></h4>
              <div className="mt-3 flex gap-3">
                {product.colors.map((c) => (
                  <button key={c.name} onClick={() => setColor(c.name)} aria-label={c.name} className={`h-10 w-10 rounded-full border-2 transition ${color === c.name ? "border-foreground" : "border-transparent"}`} style={{ background: c.hex }} />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Size</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`rounded-full border px-5 py-2 text-sm transition ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/40"}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex gap-3">
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.97 }}
              className="relative flex-1 overflow-hidden rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-elegant"
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span key="added" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" /> Added to bag
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>Add to bag</motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <button onClick={() => toggleWishlist(product.id)} aria-label="Wishlist" className="rounded-full border border-border p-4 transition hover:border-gold">
              <Heart className={`h-5 w-5 ${liked ? "fill-gold text-gold" : ""}`} />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8 text-xs">
            {[
              { Icon: Truck, label: "Free shipping over $200" },
              { Icon: RotateCcw, label: "30-day returns" },
              { Icon: ShieldCheck, label: "Lifetime craftsmanship" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                <Icon className="h-5 w-5 text-gold" /><span>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-32">
          <h2 className="font-display text-3xl font-light">You may also love</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}