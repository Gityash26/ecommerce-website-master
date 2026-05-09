import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useShop } from "@/lib/store";
import { motion } from "framer-motion";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useShop();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Create Auth Account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Insert into 'profiles' table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          { 
            id: authData.user.id, 
            first_name: formData.firstName, 
            last_name: formData.lastName,
            phone_number: formData.phone 
          }
        ]);

      if (profileError) console.error("Profile sync error:", profileError.message);

      setUser({ email: authData.user.email! });
      navigate({ to: "/" });
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-4xl mb-2">Join Maison Or</h1>
        <p className="text-muted-foreground text-sm mb-10">Create an account to manage your collection.</p>
        
        <form onSubmit={handleSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">First Name</label>
            <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Last Name</label>
            <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email Address</label>
            <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent" />
          </div>
          <div className="md:col-span-1">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Phone Number</label>
            <input required type="tel" pattern="[0-9]{10}" placeholder="10 Digit Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent" />
          </div>
          <div className="md:col-span-1">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Password</label>
            <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent" />
          </div>
          
          <div className="md:col-span-2 mt-6">
            <button disabled={loading} className="w-full bg-foreground text-background py-4 rounded-full hover:opacity-90 transition shadow-elegant disabled:opacity-50">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}