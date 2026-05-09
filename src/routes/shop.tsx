import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { ProductCard } from "@/components/shop/ProductCard";
import { useShop } from "@/lib/store"; 
import { CATEGORIES } from "@/data/products"; // Keep categories static

const search = z.object({
  category: fallback(z.string(), "all").default("all"),
  sort: fallback(z.enum(["featured", "price-asc", "price-desc", "rating"]), "featured").default("featured"),
});

export const Route = createFileRoute("/shop")({
  validateSearch: zodValidator(search),
  head: () => ({
    meta: [
      { title: "Shop — Maison Or" },
      { name: "description", content: "Browse our complete collection of curated home objects." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category, sort } = Route.useSearch();
  const navigate = useNavigate();
  const { products } = useShop(); // 1. Get live products from your store hook
  
  const [maxPrice, setMaxPrice] = useState(3000);
  const [minRating, setMinRating] = useState(0);
  const [visible, setVisible] = useState(8);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set loading to false once products are fetched
  useEffect(() => {
    if (products.length > 0 || loading) {
       const t = setTimeout(() => setLoading(false), 800);
       return () => clearTimeout(t);
    }
  }, [products]);

  // 2. Update filtered logic to use 'products' from useShop instead of 'PRODUCTS'
  const filtered = useMemo(() => {
    if (!products) return [];
    
    let list = products.filter((p) => 
      (category === "all" || p.category === category) && 
      p.price <= maxPrice && 
      p.rating.rate >= minRating
    );

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating.rate - a.rating.rate);
    
    return list;
  }, [products, category, sort, maxPrice, minRating]);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
        setVisible((v) => Math.min(v + 4, filtered.length));
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [filtered.length]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Collection</p>
        <h1 className="mt-3 font-display text-5xl font-light sm:text-6xl">
            {category === "all" ? "Every object" : CATEGORIES.find((c) => c.slug === category)?.name ?? "Shop"}
        </h1>
      </motion.div>

      {/* ... keep Categories and Sort UI same as your code ... */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Link to="/shop" search={{ category: "all", sort }} className={`rounded-full border px-4 py-2 text-sm transition ${category === "all" ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/40"}`}>All</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/shop" search={{ category: c.slug, sort }} className={`rounded-full border px-4 py-2 text-sm transition ${category === c.slug ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/40"}`}>{c.name}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40 lg:hidden">
             <SlidersHorizontal className="h-4 w-4" /> Filters
           </button>
           <select
             value={sort}
             onChange={(e) => navigate({ to: "/shop", search: { category, sort: e.target.value as typeof sort } })}
             className="rounded-full border border-border bg-background px-4 py-2 text-sm"
           >
             <option value="featured">Featured</option>
             <option value="price-asc">Price: low to high</option>
             <option value="price-desc">Price: high to low</option>
             <option value="rating">Top rated</option>
           </select>
        </div>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <FiltersPanel maxPrice={maxPrice} setMaxPrice={setMaxPrice} minRating={minRating} setMinRating={setMinRating} />
        </aside>

        <div>
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
               {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="animate-pulse">
                   <div className="aspect-[4/5] rounded-xl bg-muted" />
                   <div className="mt-4 h-4 w-2/3 rounded bg-muted" />
                   <div className="mt-2 h-3 w-1/3 rounded bg-muted" />
                 </div>
               ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.slice(0, visible).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
              {filtered.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-lg font-display text-muted-foreground">No objects found.</p>
                    <p className="text-sm text-muted-foreground/60">Try adjusting your filters or check the database connection.</p>
                </div>
              )}
              {visible < filtered.length && <div className="mt-12 text-center text-sm text-muted-foreground">Loading more…</div>}
            </>
          )}
        </div>
      </div>
      
      {/* ... keep AnimatePresence and FiltersPanel exactly as you had them ... */}
       <AnimatePresence>
        {filtersOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)} className="fixed inset-0 z-50 bg-black/40 lg:hidden">
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.4, ease: [0.2,0.8,0.2,1] }} onClick={(e) => e.stopPropagation()} className="absolute right-0 top-0 h-full w-80 bg-background p-6">
              <div className="flex items-center justify-between"><h3 className="font-display text-2xl">Filters</h3><button onClick={() => setFiltersOpen(false)}><X className="h-5 w-5" /></button></div>
              <div className="mt-8"><FiltersPanel maxPrice={maxPrice} setMaxPrice={setMaxPrice} minRating={minRating} setMinRating={setMinRating} /></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FiltersPanel({ maxPrice, setMaxPrice, minRating, setMinRating }: { maxPrice: number; setMaxPrice: (n: number) => void; minRating: number; setMinRating: (n: number) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Price</h4>
        <div className="mt-4">
          <input type="range" min={50} max={3000} step={50} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[--gold]" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>$50</span><span className="font-medium text-foreground">Up to ${maxPrice}</span></div>
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rating</h4>
        <div className="mt-4 flex flex-col gap-2">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={`rounded-lg border px-3 py-2 text-left text-sm transition ${minRating === r ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40"}`}>
              {r === 0 ? "All ratings" : `${r}★ & up`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}