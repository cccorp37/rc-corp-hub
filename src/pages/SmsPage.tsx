import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MessageSquare, Send, History, CreditCard } from "lucide-react";

const SmsPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState("subscribe");
  const [smsCount, setSmsCount] = useState(500);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Campaign form
  const [title, setTitle] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from("sms_campaigns").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
        if (data) setCampaigns(data);
      });
    }
  }, [user]);

  const handleSubscribe = async () => {
    if (!user) return;
    setLoading(true);
    const totalAmount = smsCount * 125;
    const { error } = await supabase.from("sms_packages").insert({
      user_id: user.id,
      sms_count: smsCount,
      total_amount: totalAmount,
      status: "paid",
    });
    if (!error) {
      // Update sms_balance
      await supabase.from("profiles").update({ sms_balance: (profile?.sms_balance || 0) + smsCount }).eq("user_id", user.id);
      await refreshProfile();
      toast.success(`${smsCount} SMS crédités sur votre compte !`);
    } else {
      toast.error("Erreur lors de la souscription");
    }
    setLoading(false);
  };

  const handleCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const recipientList = recipients.split(/[\n,]/).map((r) => r.trim()).filter(Boolean);
    if (recipientList.length === 0) {
      toast.error("Ajoutez au moins un destinataire");
      return;
    }
    if ((profile?.sms_balance || 0) < recipientList.length) {
      toast.error("Solde SMS insuffisant");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("sms_campaigns").insert({
      user_id: user.id,
      title,
      sender_name: senderName,
      message,
      recipients: recipientList,
      scheduled_at: scheduledAt || null,
      sms_used: recipientList.length,
      status: "pending",
    });
    if (!error) {
      await supabase.from("profiles").update({ sms_balance: (profile?.sms_balance || 0) - recipientList.length }).eq("user_id", user.id);
      await refreshProfile();
      toast.success("Campagne soumise avec succès !");
      setTitle(""); setSenderName(""); setMessage(""); setRecipients(""); setScheduledAt("");
    } else {
      toast.error("Erreur lors de la soumission");
    }
    setLoading(false);
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-warning/10 text-warning",
      sent: "bg-green-50 text-green-600",
      failed: "bg-destructive/10 text-destructive",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">SMS Marketing</h1>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
          {profile?.sms_balance || 0} SMS
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="subscribe"><CreditCard className="h-4 w-4 mr-1" /> Pack</TabsTrigger>
          <TabsTrigger value="campaign"><Send className="h-4 w-4 mr-1" /> Campagne</TabsTrigger>
          <TabsTrigger value="history"><History className="h-4 w-4 mr-1" /> Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribe" className="space-y-4 mt-4">
          <div className="bg-card border rounded-xl p-4 space-y-4">
            <div className="text-center">
              <MessageSquare className="h-10 w-10 text-primary mx-auto mb-2" />
              <h2 className="font-semibold">Souscrire un Pack SMS</h2>
              <p className="text-xs text-muted-foreground">125 FCFA / SMS — Minimum 500 SMS</p>
            </div>
            <div className="space-y-2">
              <Label>Nombre de SMS</Label>
              <Input type="number" min={500} step={100} value={smsCount} onChange={(e) => setSmsCount(Math.max(500, Number(e.target.value)))} />
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">Montant total</p>
              <p className="text-2xl font-bold text-foreground">{(smsCount * 125).toLocaleString()} FCFA</p>
            </div>
            <Button className="w-full" onClick={handleSubscribe} disabled={loading}>
              {loading ? "Traitement..." : "Payer"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="campaign" className="mt-4">
          <form onSubmit={handleCampaign} className="bg-card border rounded-xl p-4 space-y-4">
            <div className="space-y-2">
              <Label>Titre de la campagne</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Nom d'expéditeur</Label>
              <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="MonEntreprise" required />
            </div>
            <div className="space-y-2">
              <Label>Message ({message.length}/160)</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 160))} maxLength={160} rows={3} required />
            </div>
            <div className="space-y-2">
              <Label>Destinataires (6XXXXXXXX, un par ligne)</Label>
              <Textarea value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="699000000&#10;677000000" rows={3} required />
            </div>
            <div className="space-y-2">
              <Label>Date/Heure d'envoi (optionnel)</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Envoi..." : "Lancer la campagne"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Aucune campagne</p>
            </div>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="bg-card border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{c.title}</p>
                  {statusBadge(c.status)}
                </div>
                <p className="text-xs text-muted-foreground">{c.recipients?.length || 0} destinataires • {c.sms_used} SMS</p>
                <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmsPage;
