import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useShop } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

// Helper for password validation logic
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

  // Real-time validation checks
  const checks = validatePassword(formData.password);
  const isPasswordValid = Object.values(checks).every(Boolean);

  const handleInitialSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Check if phone number already exists in profiles table
    const { data: existingPhone } = await supabase
      .from("profiles")
      .select("phone_number")
      .eq("phone_number", formData.phone)
      .single();

    if (existingPhone) {
      alert("This phone number is already registered.");
      setLoading(false);
      return;
    }

    // 2. Create Auth Account with Metadata
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

    // 3. Logic for "Instant Login" (Confirm Email OFF) vs "OTP" (Confirm Email ON)
    if (data?.session) {
      // If session exists immediately, user is auto-confirmed/logged in
      setUser({ email: data.user?.email! });
      navigate({ to: "/account" });
    } else {
      // Otherwise, proceed to OTP verification step
      setStep("otp");
      alert("A verification code has been sent to your email.");
    }

    setLoading(false);
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
      // PASS BOTH EMAIL AND NAME HERE
      setUser({
        email: data.user.email!,
        name: formData.firstName, // This makes the name appear in Navbar instantly
      });
      navigate({ to: "/account" });
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <AnimatePresence mode="wait">
        {step === "details" ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h1 className="font-display text-4xl mb-2">Join Maison Or</h1>
            <p className="text-muted-foreground text-sm mb-10">
              Create an account to manage your collection.
            </p>

            <form
              onSubmit={handleInitialSignUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            >
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  First Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Last Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  pattern="[0-9]{10}"
                  placeholder="10 Digit Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent"
                />
              </div>
              <div className="md:col-span-1 relative">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Password
                </label>
                <input
                  required
                  type="password"
                  value={formData.password}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setTimeout(() => setPasswordFocused(false), 200)}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent"
                />

                <AnimatePresence>
                  {passwordFocused && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute z-10 top-full mt-4 w-full bg-background/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl"
                    >
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
                        Security Requirements
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        <RequirementItem label="Uppercase Letter" met={checks.hasUpper} />
                        <RequirementItem label="Lowercase Letter" met={checks.hasLower} />
                        <RequirementItem label="Numerical Digit" met={checks.hasDigit} />
                        <RequirementItem label="Special Character" met={checks.hasSpecial} />
                        <RequirementItem label="At least 8 characters" met={checks.isLong} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="md:col-span-2 mt-6">
                <button
                  disabled={loading || !isPasswordValid}
                  className="w-full bg-foreground text-background py-4 rounded-full hover:opacity-90 transition shadow-elegant disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Register"}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="font-display text-4xl mb-2">Verify Email</h1>
            <p className="text-muted-foreground text-sm mb-10">
              Enter the 6-digit code sent to {formData.email}.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  OTP Code
                </label>
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border-b border-border py-2 text-center text-2xl tracking-[1em] outline-none focus:border-gold bg-transparent"
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-gold text-white py-4 rounded-full hover:opacity-90 transition shadow-elegant"
              >
                {loading ? "Verifying..." : "Verify & Complete Signup"}
              </button>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-full text-xs text-muted-foreground uppercase tracking-widest hover:text-foreground"
              >
                Back to Details
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RequirementItem({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${met ? "bg-gold shadow-[0_0_8px_#D4AF37]" : "bg-border"}`}
      />
      <span
        className={`text-[10px] tracking-wide transition-colors ${met ? "text-foreground font-medium" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </div>
  );
}
