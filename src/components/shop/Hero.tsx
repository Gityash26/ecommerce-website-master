import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const SLIDES = [
  { src: hero1, label: "Terra Vase", price: "$475" },
  { src: hero2, label: "Lumina Lamp", price: "$1,250" },
  { src: hero3, label: "Sol Lounge Chair", price: "$2,900" },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-marble">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-gold/15 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24 lg:px-10 lg:pb-32 lg:pt-28">
        <motion.div style={{ y, opacity }} className="relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            New · Autumn Collection
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-6 font-display text-5xl font-light leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl"
          >
            Curated objects for a life of <em className="font-normal italic text-gold">refined simplicity</em>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground text-balance"
          >
            Each piece is chosen for the way it harmonizes form and function — crafted to endure, designed to inspire.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-elegant transition hover:scale-[1.02]"
            >
              Shop the collection
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link to="/shop" className="story-link text-sm font-medium">Browse new arrivals</Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 flex items-center gap-8 text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            <div><div className="font-display text-2xl normal-case tracking-normal text-foreground">12k+</div>Homes furnished</div>
            <div className="h-10 w-px bg-border" />
            <div><div className="font-display text-2xl normal-case tracking-normal text-foreground">4.9</div>Avg. rating</div>
            <div className="h-10 w-px bg-border" />
            <div><div className="font-display text-2xl normal-case tracking-normal text-foreground">86</div>Artisans</div>
          </motion.div>
        </motion.div>

        {/* 3D crossfade gallery */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none [perspective:1600px]">
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-full w-full"
          >
            {SLIDES.map((s, i) => {
              const offset = (i - active + SLIDES.length) % SLIDES.length;
              const isActive = offset === 0;
              const isNext = offset === 1;
              return (
                <motion.div
                  key={s.src}
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : isNext ? 0.55 : 0,
                    scale: isActive ? 1 : isNext ? 0.92 : 0.85,
                    rotateY: isActive ? 0 : isNext ? -14 : -22,
                    x: isActive ? 0 : isNext ? "8%" : "16%",
                    zIndex: 10 - offset,
                  }}
                  transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
                  className="absolute inset-0 origin-center overflow-hidden rounded-2xl shadow-elegant [transform-style:preserve-3d]"
                  style={{ filter: isActive ? "none" : "saturate(0.85)" }}
                >
                  <img src={s.src} alt={s.label} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-6">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/70">Featured</div>
                    <div className="flex items-end justify-between">
                      <div className="font-display text-xl text-white">{s.label}</div>
                      <div className="font-display text-lg tabular-nums text-white">{s.price}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {SLIDES.map((_, i) => (
              <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => setActive(i)} className="group p-1">
                <span className={`block h-[2px] w-8 transition-all duration-500 ${i === active ? "bg-gold w-12" : "bg-foreground/20"}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
