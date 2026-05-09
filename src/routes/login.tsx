import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useShop } from "@/lib/store";
import { motion } from "framer-motion";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useShop();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else if (data.user) {
      setUser({ email: data.user.email! });
      navigate({ to: "/" });
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md px-6 py-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-4xl mb-8">Sign In</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent transition" 
              required 
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Password</label>
              <Link 
                to="/forgot-password" 
                className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-gold transition"
              >
                Forgot?
              </Link>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent transition" 
              required 
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-foreground text-background py-4 rounded-full hover:opacity-90 transition mt-4 shadow-elegant disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Continue"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          New to Maison Or?{" "}
          <Link to="/signup" className="text-foreground underline underline-offset-4 hover:text-gold transition">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}