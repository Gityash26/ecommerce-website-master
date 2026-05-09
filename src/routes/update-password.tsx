import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/update-password")({
  component: UpdatePassword,
});

function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully!");
      navigate({ to: "/login" });
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md px-6 py-40">
      <h1 className="font-display text-4xl mb-8">New Password</h1>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">New Password</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-b border-border py-2 outline-none focus:border-gold bg-transparent" />
        </div>
        <button disabled={loading} className="w-full bg-foreground text-background py-4 rounded-full shadow-elegant">
          Update Password
        </button>
      </form>
    </div>
  );
}