import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Hero } from "@/components/shop/Hero";
import { ProductCard } from "@/components/shop/ProductCard";
import { useShop } from "@/lib/store"; // Import the hook to access live data
import { CATEGORIES } from "@/data/products"; // Only keep CATEGORIES from the local file

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Or — Curated Objects for Refined Living" },
      {
        name: "description",
        content:
          "Discover sculptural lighting, vases, and furniture crafted to endure. Editorial home objects from independent artisans.",
      },
      { property: "og:title", content: "Maison Or — Curated Objects for Refined Living" },
      {
        property: "og:description",
        content: "Sculptural lighting, vases, and furniture crafted to endure.",
      },
    ],
  }),
  component: Index,
});

const TESTIMONIALS = [
  {
    quote:
      "Every piece feels like an heirloom. The Lumina lamp transformed my reading nook entirely.",
    name: "Amélie R.",
    role: "Interior Designer, Paris",
  },
  {
    quote: "Quality you can feel the moment you unbox. Maison Or has become my only stop.",
    name: "Daniel K.",
    role: "Architect, Copenhagen",
  },
  {
    quote: "Restraint and warmth in equal measure. A rare combination, beautifully done.",
    name: "Priya S.",
    role: "Stylist, London",
  },
];

function Index() {
  const { products } = useShop();

  // Add this safety check:
  // If products is undefined or hasn't loaded yet, we show a loading message
  if (!products) {
    return (
      <div className="flex h-screen items-center justify-center bg-marble">
        <p className="font-display text-xl animate-pulse">Loading curated objects...</p>
      </div>
    );
  }

  // Now it is safe to slice because we know 'products' exists
  const featured = products.slice(0, 4);

  return (
    <>
      <Hero />

      {/* ... keep the rest of your categories section code ... */}

      {/* Featured Section */}
      <section className="border-y border-border bg-marble">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                This season
              </p>
              <h2 className="mt-3 font-display text-4xl font-light leading-tight sm:text-5xl">
                Featured objects
              </h2>
            </div>
            <Link to="/shop" className="group inline-flex items-center gap-2 text-sm font-medium">
              Shop all <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {featured.length > 0 ? (
              featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            ) : (
              <p className="col-span-full text-center py-10 text-muted-foreground">
                No products found in database.
              </p>
            )}
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Praise</p>
          <h2 className="mt-3 font-display text-4xl font-light leading-tight sm:text-5xl">
            Quietly loved by collectors of beautiful things.
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-8 shadow-soft"
            >
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-5 font-display text-lg leading-snug text-balance">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <div className="font-medium">{t.name}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-10 py-20 text-center text-primary-foreground">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/30 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/60">
            The Maison Letter
          </p>
          <h3 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-light leading-tight sm:text-5xl">
            New arrivals, studio visits, and quiet stories — every other Sunday.
          </h3>
          <form className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder="you@home.com"
              className="flex-1 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:border-gold"
            />
            <button className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-gold-foreground shadow-gold transition hover:scale-[1.02]">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
