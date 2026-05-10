import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useShop } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Account — Maison Or" }] }),
  component: Account,
});

function Account() {
  const { user, logout } = useShop();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAccountData() {
      if (!user) return;

      // 1. Fetch Profile (Handled by our new SQL Trigger)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone_number")
        .single();

      // 2. Fetch Recent Orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
          total_amount,
          order_items (
            quantity,
            price_at_purchase,
            product_id
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (profileData) setProfile(profileData);
      if (ordersData) setOrders(ordersData);
      setLoading(false);
    }

    loadAccountData();
  }, [user]);

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <header className="border-b border-border pb-10 mb-12 flex justify-between items-end">
          <div>
            <h1 className="font-display text-5xl mb-2">My Account</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest">
              Personal Collection & History
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive transition"
          >
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* User Profile Details */}
          <section className="lg:col-span-1 space-y-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em]">Profile Details</h2>
            <div className="space-y-6">
              <DetailItem
                label="Full Name"
                value={loading ? "..." : `${profile?.first_name} ${profile?.last_name}`}
              />
              <DetailItem label="Email" value={user.email} />
              <DetailItem
                label="Phone"
                value={loading ? "..." : profile?.phone_number || "Not set"}
              />
            </div>
          </section>

          {/* Recent Orders Section */}
          <section className="lg:col-span-2 space-y-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em]">Recent Orders</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground italic">Retrieving order history...</p>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-border p-6 rounded-xl flex justify-between items-center hover:bg-muted/30 transition"
                  >
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">
                        Order ID: {order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-display">${order.total_amount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        {order.order_items.length} Items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/20 p-12 rounded-2xl text-center border border-dashed border-border">
                <p className="text-sm text-muted-foreground mb-4">No orders found yet.</p>
                <button
                  onClick={() => navigate({ to: "/shop" })}
                  /* ADD 'cursor-pointer' TO THE CLASSNAME BELOW */
                  className="text-xs uppercase tracking-widest border-b border-foreground pb-1 cursor-pointer hover:text-gold transition-all"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
