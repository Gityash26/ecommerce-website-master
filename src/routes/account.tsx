import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Account — Maison Or" }] }),
  component: Account,
});

function Account() {
  const { user, setUser } = useShop();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  if (user) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <h1 className="font-display text-4xl font-light">Welcome back</h1>
        <p className="mt-3 text-muted-foreground">{user.email}</p>
        <button onClick={() => setUser(null)} className="mt-8 rounded-full border border-border px-6 py-3 text-sm hover:border-foreground/40">Sign out</button>
      </div>
    );
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    if (email) setUser({ email });
  };

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <h1 className="font-display text-4xl font-light">{mode === "signin" ? "Sign in" : "Create account"}</h1>
      <p className="mt-3 text-muted-foreground">{mode === "signin" ? "Welcome back to Maison Or." : "Save your wishlist and orders."}</p>

      <AnimatePresence mode="wait">
        <motion.form key={mode} onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="mt-10 space-y-4">
          {mode === "signup" && <Field name="name" label="Full name" />}
          <Field name="email" type="email" label="Email" />
          <Field name="password" type="password" label="Password" />
          <button className="mt-4 w-full rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-elegant">{mode === "signin" ? "Sign in" : "Create account"}</button>
        </motion.form>
      </AnimatePresence>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New here?" : "Already a member?"}{" "}
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="story-link text-foreground">{mode === "signin" ? "Create an account" : "Sign in"}</button>
      </p>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input {...rest} required className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20" />
    </label>
  );
}
