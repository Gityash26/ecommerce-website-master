import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { useShop } from "@/lib/store";
// Removed the PRODUCTS import because we are now using the live database

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Maison Or" }] }),
  component: Wishlist,
});

function Wishlist() {
  // 1. Get both wishlist IDs AND the products array from the store
  const { wishlist, products } = useShop();

  // 2. Filter the live products array instead of the static local file
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
      <h1 className="font-display text-5xl font-light sm:text-6xl">Wishlist</h1>
      <p className="mt-3 text-muted-foreground">Your saved objects.</p>
      
      {items.length === 0 ? (
        <div className="mt-20 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-6 text-muted-foreground">Nothing saved yet.</p>
          <Link to="/shop" className="story-link mt-4 inline-block">Browse the collection</Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}