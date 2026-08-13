import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, TrendingUp, TrendingDown, Calendar, Smartphone, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const TransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("payment_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTransactions(data || []);
        setLoading(false);
      });
  }, [user]);

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning border-warning/20",
    success: "bg-success/10 text-success border-success/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    cancelled: "bg-muted text-muted-foreground border-border",
  };

  const statusLabels: Record<string, string> = {
    pending: "En attente",
    success: "Réussi",
    failed: "Échoué",
    cancelled: "Annulé",
  };

  const totalSpent = transactions.filter((t) => t.status === "success").reduce((sum, t) => sum + Number(t.amount), 0);
  const successCount = transactions.filter((t) => t.status === "success").length;
  const failedCount = transactions.filter((t) => t.status === "failed").length;

  const renderList = (filter: string | null) => {
    const list = filter ? transactions.filter((t) => t.status === filter) : transactions;
    if (list.length === 0) {
      return (
        <div className="text-center py-12 animate-fade-in">
          <CreditCard className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Aucune transaction</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {list.map((t) => (
          <div key={t.id} className="bg-card border rounded-xl p-4 space-y-2 animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-foreground truncate">{t.description || "Paiement"}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" /> {t.payer_phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {t.payer_country}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-sm text-foreground">{Number(t.amount).toLocaleString()} FCFA</p>
                <Badge variant="outline" className={`mt-1 text-[10px] ${statusColors[t.status] || ""}`}>
                  {statusLabels[t.status] || t.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(t.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Mes Paiements</h1>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border rounded-xl p-3 text-center">
          <p className="text-lg font-extrabold text-foreground">{totalSpent.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">FCFA dépensés</p>
        </div>
        <div className="bg-card border rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="h-4 w-4 text-success" />
            <p className="text-lg font-extrabold text-success">{successCount}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Réussis</p>
        </div>
        <div className="bg-card border rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <p className="text-lg font-extrabold text-destructive">{failedCount}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Échoués</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all" className="text-xs">Tous</TabsTrigger>
            <TabsTrigger value="success" className="text-xs">Réussis</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">En attente</TabsTrigger>
            <TabsTrigger value="failed" className="text-xs">Échoués</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">{renderList(null)}</TabsContent>
          <TabsContent value="success" className="mt-4">{renderList("success")}</TabsContent>
          <TabsContent value="pending" className="mt-4">{renderList("pending")}</TabsContent>
          <TabsContent value="failed" className="mt-4">{renderList("failed")}</TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default TransactionsPage;
