import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CreditCard, BookOpen, Store } from "lucide-react";

const coachingModules = [
  "Marketing des Réseaux Sociaux",
  "SEO & Référencement",
  "IA Appliquée au Marketing",
  "Publicité en Ligne",
  "Branding & Identité Visuelle",
];

const ServicesPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "recharge";

  // Recharge UBA
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("");

  // Coaching
  const [coachModule, setCoachModule] = useState("");
  const [coachHours, setCoachHours] = useState(1);
  const [coachDate, setCoachDate] = useState("");

  // Shop
  const [platformType, setPlatformType] = useState("");
  const [platformSupport, setPlatformSupport] = useState("web");
  const [businessDomain, setBusinessDomain] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("La recharge UBA sera bientôt disponible. Contactez le support.");
  };

  const handleCoaching = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("coaching_sessions").insert({
      user_id: user.id,
      module: coachModule,
      hours: coachHours,
      total_amount: coachHours * 1000,
      scheduled_date: coachDate || null,
    });
    if (error) {
      toast.error("Erreur lors de la réservation");
    } else {
      toast.success("Session de coaching réservée !");
      setCoachModule(""); setCoachHours(1); setCoachDate("");
    }
    setLoading(false);
  };

  const handleShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("shop_requests").insert({
      user_id: user.id,
      platform_type: platformType,
      platform_support: platformSupport,
      business_domain: businessDomain,
      contact_info: contactInfo,
    });
    if (error) {
      toast.error("Erreur lors de la soumission");
    } else {
      toast.success("Demande de création soumise !");
      setPlatformType(""); setPlatformSupport("web"); setBusinessDomain(""); setContactInfo("");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold text-foreground">Services</h1>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="recharge"><CreditCard className="h-4 w-4 mr-1" /> UBA</TabsTrigger>
          <TabsTrigger value="coaching"><BookOpen className="h-4 w-4 mr-1" /> Coaching</TabsTrigger>
          <TabsTrigger value="shop"><Store className="h-4 w-4 mr-1" /> Boutique</TabsTrigger>
        </TabsList>

        <TabsContent value="recharge" className="mt-4">
          <form onSubmit={handleRecharge} className="bg-card border rounded-xl p-4 space-y-4">
            <div className="text-center mb-2">
              <CreditCard className="h-10 w-10 text-primary mx-auto mb-2" />
              <h2 className="font-semibold">Recharge Carte UBA</h2>
            </div>
            <div className="space-y-2">
              <Label>Numéro de carte</Label>
              <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="XXXX XXXX XXXX XXXX" required />
            </div>
            <div className="space-y-2">
              <Label>Nom du titulaire</Label>
              <Input value={cardName} onChange={(e) => setCardName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Montant (FCFA)</Label>
              <Input type="number" value={rechargeAmount} onChange={(e) => setRechargeAmount(e.target.value)} placeholder="5000" required />
            </div>
            <Button type="submit" className="w-full">Recharger</Button>
          </form>
        </TabsContent>

        <TabsContent value="coaching" className="mt-4">
          <form onSubmit={handleCoaching} className="bg-card border rounded-xl p-4 space-y-4">
            <div className="text-center mb-2">
              <BookOpen className="h-10 w-10 text-primary mx-auto mb-2" />
              <h2 className="font-semibold">Coaching & Formation</h2>
              <p className="text-xs text-muted-foreground">1 000 FCFA / heure</p>
            </div>
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={coachModule} onValueChange={setCoachModule}>
                <SelectTrigger><SelectValue placeholder="Choisir un module" /></SelectTrigger>
                <SelectContent>
                  {coachingModules.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Durée (heures)</Label>
              <Input type="number" min={1} value={coachHours} onChange={(e) => setCoachHours(Number(e.target.value))} />
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{(coachHours * 1000).toLocaleString()} FCFA</p>
            </div>
            <div className="space-y-2">
              <Label>Date souhaitée</Label>
              <Input type="datetime-local" value={coachDate} onChange={(e) => setCoachDate(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Réservation..." : "Réserver"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="shop" className="mt-4">
          <form onSubmit={handleShop} className="bg-card border rounded-xl p-4 space-y-4">
            <div className="text-center mb-2">
              <Store className="h-10 w-10 text-primary mx-auto mb-2" />
              <h2 className="font-semibold">Création de Plateforme</h2>
            </div>
            <div className="space-y-2">
              <Label>Type de plateforme</Label>
              <Input value={platformType} onChange={(e) => setPlatformType(e.target.value)} placeholder="E-commerce, Blog, Portfolio..." required />
            </div>
            <div className="space-y-2">
              <Label>Support</Label>
              <Select value={platformSupport} onValueChange={setPlatformSupport}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="both">Web + Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Domaine d'activité</Label>
              <Input value={businessDomain} onChange={(e) => setBusinessDomain(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Contact / Infos complémentaires</Label>
              <Textarea value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} rows={3} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Envoi..." : "Soumettre la demande"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServicesPage;
