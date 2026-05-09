import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) alert(error.message);
    else setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-6 py-40 text-center">
        <MailCheck className="mx-auto h-12 w-12 text-gold mb-6" />
        <h1 className="font-display text-3xl">Check your email</h1>
        <p className="mt-4 text-muted-foreground">A recovery link has been sent to <b>{email}</b>.</p>
        <Link to="/login" className="story-link mt-8 inline-block">Back to login</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-32">
      <h1 className="font-display text-4xl mb-4">Reset Password</h1>
      <p className="text-muted-foreground text-sm mb-8">Enter your email and we'll send you a recovery link.</p>
      <form onSubmit={handleReset} className="space-y-6">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent" />
        </div>
        <button disabled={loading} className="w-full bg-foreground text-background py-4 rounded-full shadow-elegant transition">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}