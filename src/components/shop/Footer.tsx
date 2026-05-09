import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-marble">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-4 lg:px-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gold-gradient shadow-gold" />
            <span className="font-display text-xl">Maison Or</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Curated objects for a life of refined simplicity. Crafted to endure.
          </p>
          <div className="mt-6 flex gap-2">
            {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" aria-label="Social" className="rounded-full border border-border p-2.5 text-foreground/70 transition hover:border-gold hover:text-gold">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Shop", links: [["All", "/shop"], ["Lighting", "/shop?category=lighting"], ["Vases", "/shop?category=vases"], ["Furniture", "/shop?category=furniture"]] },
          { title: "Maison", links: [["About", "/"], ["Journal", "/"], ["Contact", "/"], ["Press", "/"]] },
          { title: "Care", links: [["Shipping", "/"], ["Returns", "/"], ["FAQ", "/"], ["Trade Program", "/"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm uppercase tracking-[0.18em] text-muted-foreground">{col.title}</h4>
            <ul className="mt-5 space-y-3">
              {col.links.map(([label, href]) => (
                <li key={label}><Link to={href as string} className="story-link text-sm">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground lg:flex-row lg:px-10">
          <p>© {new Date().getFullYear()} Maison Or. Crafted with care.</p>
          <p>Designed in Paris · Made worldwide</p>
        </div>
      </div>
    </footer>
  );
}
