import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, MessageSquare, Briefcase, Star, Bell, ChevronRight, TrendingUp, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { profile } = useAuth();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("testimonials").select("*").order("created_at", { ascending: false }).limit(5).then(({ data }) => {
      if (data) setTestimonials(data);
    });
    supabase.from("notifications").select("*").order("sent_at", { ascending: false }).limit(3).then(({ data }) => {
      if (data) setNotifications(data);
    });
  }, []);

  const services = [
    { icon: ShoppingBag, label: "Marketplace", desc: "Ebooks, billets, produits", to: "/marketplace", color: "bg-blue-50 text-blue-600" },
    { icon: MessageSquare, label: "SMS Marketing", desc: "Campagnes SMS Orange", to: "/sms", color: "bg-orange-50 text-orange-600" },
    { icon: TrendingUp, label: "Recharge UBA", desc: "Recharge carte bancaire", to: "/services", color: "bg-green-50 text-green-600" },
    { icon: BookOpen, label: "Coaching", desc: "Formation en ligne", to: "/services?tab=coaching", color: "bg-purple-50 text-purple-600" },
    { icon: Users, label: "Création Boutique", desc: "Plateforme sur mesure", to: "/services?tab=shop", color: "bg-rose-50 text-rose-600" },
    { icon: Bell, label: "Notifications", desc: "Restez informé", to: "/profile?tab=notifications", color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Bienvenue,</p>
          <h1 className="text-xl font-bold text-foreground">
            {profile?.first_name || "Utilisateur"} 👋
          </h1>
        </div>
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">
            {(profile?.first_name?.[0] || "U").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Notifications banner */}
      {notifications.length > 0 && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{notifications[0]?.title}</span>
          </div>
          <p className="text-xs text-muted-foreground">{notifications[0]?.body}</p>
        </div>
      )}

      {/* Services Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Nos Services</h2>
        <div className="grid grid-cols-2 gap-3">
          {services.map(({ icon: Icon, label, desc, to, color }) => (
            <Link
              key={label}
              to={to}
              className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow active:scale-[0.97] group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-medium text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Témoignages</h2>
          <div className="space-y-3">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-card border rounded-xl p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                    {t.author_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.author_name}</p>
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
        <h2 className="text-lg font-semibold text-foreground mb-3">Accès rapide</h2>
        <div className="space-y-2">
          <Link to="/profile?tab=help" className="flex items-center justify-between bg-card border rounded-xl p-4 hover:shadow-sm transition-shadow">
            <span className="text-sm font-medium">Aide & Support</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
