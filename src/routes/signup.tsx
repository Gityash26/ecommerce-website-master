import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, forwardRef } from "react";
import { supabase } from "@/lib/supabase";
import { useShop } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

// --- TYPES ---
interface SignFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

// --- HELPERS ---
const validatePassword = (pw: string) => ({
  hasUpper: /[A-Z]/.test(pw),
  hasLower: /[a-z]/.test(pw),
  hasDigit: /[0-9]/.test(pw),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  isLong: pw.length >= 8,
});

function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { setUser } = useShop();
  const navigate = useNavigate();

  // --- REFS FOR KEYBOARD NAVIGATION ---
  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  const checks = validatePassword(formData.password);
  const isPasswordValid = Object.values(checks).every(Boolean);

  // FIXED: Added | null to the RefObject type to satisfy TypeScript
  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef: React.RefObject<HTMLInputElement | null> | null
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      } else if (isPasswordValid) {
        handleInitialSignUp(e as any);
      }
    }
  };

  const handleInitialSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: existingPhone } = await supabase
        .from("profiles")
        .select("phone_number")
        .eq("phone_number", formData.phone)
        .maybeSingle();

      if (existingPhone) {
        alert("This phone number is already registered.");
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          },
        },
      });

      if (authError) {
        alert(authError.message);
        setLoading(false);
        return;
      }

      if (data?.session) {
        setUser({ email: data.user?.email!, name: formData.firstName });
        navigate({ to: "/account" });
      } else {
        setStep("otp");
      }
    } catch (err) {
      alert("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otp,
      type: "signup",
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setUser({ email: data.user.email!, name: formData.firstName });
      navigate({ to: "/account" });
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <AnimatePresence mode="wait">
        {step === "details" ? (
          <motion.div key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h1 className="font-display text-5xl mb-4 italic">Join Maison Or.</h1>
            <p className="text-muted-foreground text-[11px] uppercase tracking-[0.3em] mb-12">Membership grants access to our exclusive collections.</p>

            <form onSubmit={handleInitialSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <SignField 
                ref={firstRef} 
                label="First Name" 
                value={formData.firstName} 
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
                onKeyDown={(e) => handleKeyPress(e, lastRef)}
              />
              <SignField 
                ref={lastRef} 
                label="Last Name" 
                value={formData.lastName} 
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
                onKeyDown={(e) => handleKeyPress(e, emailRef)}
              />
              <SignField 
                ref={emailRef} 
                label="Email" 
                type="email" 
                className="md:col-span-2" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                onKeyDown={(e) => handleKeyPress(e, phoneRef)}
              />
              <SignField 
                ref={phoneRef} 
                label="Phone Number" 
                type="tel" 
                maxLength={10} 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                onKeyDown={(e) => handleKeyPress(e, passRef)}
              />
              
              <div className="md:col-span-1 relative">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                <input
                  ref={passRef}
                  required
                  type="password"
                  value={formData.password}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setTimeout(() => setPasswordFocused(false), 200)}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onKeyDown={(e) => handleKeyPress(e, null)}
                  className="w-full border-b border-border py-3 outline-none focus:border-gold bg-transparent transition-all"
                />
                <AnimatePresence>
                  {passwordFocused && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute z-20 top-full mt-4 w-full bg-card/95 backdrop-blur-md border border-border p-6 rounded-2xl shadow-2xl">
                      <div className="space-y-2">
                        <RequirementItem label="Uppercase" met={checks.hasUpper} />
                        <RequirementItem label="Lowercase" met={checks.hasLower} />
                        <RequirementItem label="Numerical" met={checks.hasDigit} />
                        <RequirementItem label="Special" met={checks.hasSpecial} />
                        <RequirementItem label="8+ Characters" met={checks.isLong} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="md:col-span-2 mt-12">
                <button disabled={loading || !isPasswordValid} className="w-full bg-foreground text-background py-5 rounded-full font-bold uppercase tracking-[0.3em] text-[10px] shadow-elegant hover:scale-[1.01] transition-all disabled:opacity-20">
                  {loading ? "Registering..." : "Create Account"}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <h1 className="font-display text-4xl mb-2 italic">Verify Email.</h1>
             <p className="text-muted-foreground text-sm mb-10">Verification code sent to {formData.email}</p>
             <form onSubmit={handleVerifyOtp} className="space-y-10">
                <input required type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full border-b border-border py-4 text-center text-4xl tracking-[1em] outline-none focus:border-gold bg-transparent" />
                <button disabled={loading} className="w-full bg-gold text-white py-5 rounded-full uppercase tracking-widest text-xs font-bold shadow-gold">Enter the Maison</button>
             </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SignField = forwardRef<HTMLInputElement, SignFieldProps>(({ label, className, ...rest }, ref) => (
  <div className={className}>
    <label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
    <input
      ref={ref}
      required
      className="w-full border-b border-border py-3 outline-none focus:border-gold bg-transparent transition-all"
      {...rest}
    />
  </div>
));
SignField.displayName = "SignField";

function RequirementItem({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${met ? "bg-gold shadow-[0_0_8px_#D4AF37]" : "bg-border"}`} />
      <span className={`text-[10px] uppercase tracking-widest ${met ? "text-foreground font-bold" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}