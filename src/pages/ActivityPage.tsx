import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, ShoppingBag, MessageSquare, CreditCard, BookOpen, Store, LogIn, Heart } from "lucide-react";

const actionIcons: Record<string, any> = {
  payment_success: CreditCard,
  payment_failed: CreditCard,
  purchase: ShoppingBag,
  sms_campaign: MessageSquare,
  coaching: BookOpen,
  shop_request: Store,
  login: LogIn,
  favorite: Heart,
};

const ActivityPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setActivities(data || []);
        setLoading(false);
      });
  }, [user]);

  const actionLabels: Record<string, string> = {
    payment_success: "Paiement réussi",
    payment_failed: "Paiement échoué",
    purchase: "Achat",
    sms_campaign: "Campagne SMS",
    coaching: "Session de coaching",
    shop_request: "Demande de boutique",
    login: "Connexion",
    favorite: "Ajout aux favoris",
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Mon Activité</h1>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border rounded-xl p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucune activité récente</p>
        </div>
      ) : (
        <div className="relative space-y-2">
          {activities.map((a, idx) => {
            const Icon = actionIcons[a.action] || Activity;
            return (
              <div key={a.id} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                <div className="relative flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  {idx < activities.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-foreground">{actionLabels[a.action] || a.action}</p>
                  {a.detail && <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>}
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    {new Date(a.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
