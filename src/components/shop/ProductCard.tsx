import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Product } from "@/data/products";
import { useShop, formatPrice } from "@/lib/store";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { wishlist, toggleWishlist } = useShop();
  const liked = wishlist.includes(product.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
      className="group relative"
    >
      <Link to="/product/$id" params={{ id: String(product.id) }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted shadow-soft">
          <motion.img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          />
          <button
            aria-label="Wishlist"
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className="absolute right-3 top-3 rounded-full bg-background/90 p-2 backdrop-blur transition hover:scale-110"
          >
            <Heart className={`h-4 w-4 transition ${liked ? "fill-gold text-gold" : "text-foreground/70"}`} />
          </button>
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-tight">{product.title}</h3>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{product.category}</p>
          </div>
          <span className="shrink-0 font-display tabular-nums">{formatPrice(product.price)}</span>
        </div>
      </Link>
    </motion.article>
  );
}
