import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, Heart, User, Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { useShop } from "@/lib/store";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/wishlist", label: "Wishlist" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  
  const { cartCount, theme, toggleTheme, user, products, logout } = useShop();
  
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const matches = q.length > 1
    ? products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())).slice(0, 5)
    : [];

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-soft" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gold-gradient shadow-gold" />
          <span className="font-display text-xl font-medium tracking-tight">Maison Or</span>
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="story-link text-sm font-medium tracking-wide text-foreground/80 hover:text-foreground" activeProps={{ className: "text-foreground" }}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button aria-label="Search" onClick={() => setSearchOpen((o) => !o)} className="rounded-full p-2.5 text-foreground/80 transition hover:bg-accent hover:text-foreground">
            <Search className="h-4 w-4" />
          </button>
          
          <button aria-label="Theme" onClick={toggleTheme} className="rounded-full p-2.5 text-foreground/80 transition hover:bg-accent hover:text-foreground">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <Link to="/wishlist" aria-label="Wishlist" className="rounded-full p-2.5 text-foreground/80 transition hover:bg-accent hover:text-foreground">
            <Heart className="h-4 w-4" />
          </Link>

          {/* UPDATED DYNAMIC ACCOUNT LINK */}
          <div className="group relative">
            <Link 
              to={user ? "/account" : "/login"} 
              aria-label="Account" 
              className="flex items-center gap-2 rounded-full px-3 py-2 text-foreground/80 transition hover:bg-accent hover:text-foreground"
            >
              {user ? (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                  {/* FIX: Now checks for user.name first */}
                  {user.name || user.email.split('@')[0]}
                </span>
              ) : (
                <User className="h-4 w-4" />
              )}
            </Link>

            {user && (
              <div className="invisible absolute right-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="min-w-[120px] overflow-hidden rounded-xl border border-border/50 bg-background/95 p-1 shadow-xl backdrop-blur-md">
                  <button 
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 transition hover:bg-red-500/10"
                  >
                    <LogOut className="h-3 w-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          <Link to="/cart" aria-label="Cart" className="relative rounded-full p-2.5 text-foreground/80 transition hover:bg-accent hover:text-foreground">
            <ShoppingBag className="h-4 w-4" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-gold-foreground shadow-gold"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button aria-label="Menu" onClick={() => setMenuOpen(true)} className="rounded-full p-2.5 text-foreground/80 transition hover:bg-accent md:hidden">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl"
          >
            <div className="mx-auto max-w-3xl px-6 py-6">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search curated objects..."
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
                />
                <button onClick={() => { setSearchOpen(false); setQ(""); }} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
              </div>
              {matches.length > 0 && (
                <ul className="mt-4 space-y-1">
                  {matches.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => { navigate({ to: "/product/$id", params: { id: String(p.id) } }); setSearchOpen(false); setQ(""); }}
                        className="flex w-full items-center gap-4 rounded-lg p-2 text-left transition hover:bg-accent"
                      >
                        <img src={p.image} alt="" className="h-12 w-12 rounded-md object-cover" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{p.title}</div>
                          <div className="text-xs text-muted-foreground capitalize">{p.category}</div>
                        </div>
                        <div className="text-sm tabular-nums">${p.price}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.4, ease: [0.2,0.8,0.2,1] }} className="fixed inset-0 z-50 bg-background md:hidden">
            <div className="flex items-center justify-between p-6">
              <span className="font-display text-xl">Maison Or</span>
              <button onClick={() => setMenuOpen(false)} className="rounded-full p-2 hover:bg-accent"><X className="h-5 w-5" /></button>
            </div>
            <ul className="space-y-2 px-6 pt-6">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} onClick={() => setMenuOpen(false)} className="block py-3 font-display text-3xl">{l.label}</Link>
                </li>
              ))}
              <li>
                <Link to={user ? "/account" : "/login"} onClick={() => setMenuOpen(false)} className="block py-3 font-display text-3xl">
                  {user ? "Profile" : "Sign In"}
                </Link>
              </li>
              {user && (
                <li>
                  <button 
                    onClick={() => { logout(); setMenuOpen(false); }} 
                    className="block py-3 font-display text-3xl text-red-500"
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}