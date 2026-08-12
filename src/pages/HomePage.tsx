import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, MessageSquare, TrendingUp, BookOpen, Users, Bell, ChevronRight, Star, Wallet, CreditCard, Activity, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { profile } = useAuth();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ products: 0, campaigns: 0 });

  useEffect(() => {
    supabase.from("testimonials").select("*").order("created_at", { ascending: false }).limit(5).then(({ data }) => {
      if (data) setTestimonials(data);
    });
    supabase.from("notifications").select("*").order("sent_at", { ascending: false }).limit(3).then(({ data }) => {
      if (data) setNotifications(data);
    });
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_published", true).then(({ count }) => {
      setStats((s) => ({ ...s, products: count || 0 }));
    });
  }, []);

  const services = [
    { icon: ShoppingBag, label: "Boutique", desc: "Ebooks, billets, produits", to: "/marketplace", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50 text-blue-600" },
    { icon: MessageSquare, label: "SMS Marketing", desc: "Campagnes SMS en masse", to: "/sms", color: "from-orange-500 to-amber-500", bg: "bg-orange-50 text-orange-600" },
    { icon: CreditCard, label: "Recharge UBA", desc: "Recharge carte bancaire", to: "/services", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 text-emerald-600" },
    { icon: BookOpen, label: "Coaching", desc: "Formation en ligne", to: "/services?tab=coaching", color: "from-violet-500 to-purple-500", bg: "bg-violet-50 text-violet-600" },
    { icon: Users, label: "Création Boutique", desc: "Plateforme sur mesure", to: "/services?tab=shop", color: "from-rose-500 to-pink-500", bg: "bg-rose-50 text-rose-600" },
    { icon: Wallet, label: "Mes Paiements", desc: "Historique des transactions", to: "/transactions", color: "from-teal-500 to-cyan-500", bg: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-12 space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-accent to-primary p-6 text-primary-foreground animate-scale-in">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium">Bienvenue,</p>
            <h1 className="text-2xl font-extrabold mt-0.5">
              {profile?.first_name || "Utilisateur"}
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <p className="text-[10px] text-primary-foreground/70">Solde SMS</p>
                <p className="text-sm font-bold">{profile?.sms_balance || 0}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <p className="text-[10px] text-primary-foreground/70">Produits</p>
                <p className="text-sm font-bold">{stats.products}</p>
              </div>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <span className="text-white font-extrabold text-lg">
              {(profile?.first_name?.[0] || "U").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications banner */}
      {notifications.length > 0 && (
        <div className="bg-card border border-primary/10 rounded-xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">{notifications[0]?.title}</span>
          </div>
          <p className="text-xs text-muted-foreground pl-10">{notifications[0]?.body}</p>
        </div>
      )}

      {/* Services Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Nos Services
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {services.map(({ icon: Icon, label, desc, to, bg }, idx) => (
            <Link
              key={label}
              to={to}
              className="group bg-card border rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-200 active:scale-[0.97] animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${bg} group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/transactions" className="bg-card border rounded-xl p-3 text-center hover:shadow-md transition-shadow group">
          <CreditCard className="h-5 w-5 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] text-muted-foreground">Paiements</p>
        </Link>
        <Link to="/favorites" className="bg-card border rounded-xl p-3 text-center hover:shadow-md transition-shadow group">
          <Wallet className="h-5 w-5 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] text-muted-foreground">Favoris</p>
        </Link>
        <Link to="/activity" className="bg-card border rounded-xl p-3 text-center hover:shadow-md transition-shadow group">
          <Activity className="h-5 w-5 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] text-muted-foreground">Activité</p>
        </Link>
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-warning" /> Témoignages
          </h2>
          <div className="space-y-3">
            {testimonials.map((t, idx) => (
              <div key={t.id} className="bg-card border rounded-xl p-4 animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {t.author_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.author_name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{t.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Accès rapide</h2>
        <div className="space-y-2">
          <Link to="/profile?tab=help" className="flex items-center justify-between bg-card border rounded-xl p-4 hover:shadow-sm hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Aide & Support</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
