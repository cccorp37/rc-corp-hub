import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Smartphone, Globe, Shield, CircleCheck as CheckCircle2, Loader as Loader2, Wallet } from "lucide-react";
import { initiatePayment } from "@/lib/payments";

const countries = [
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "CG", name: "Congo", flag: "🇨🇬" },
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
  { code: "TD", name: "Tchad", flag: "🇹🇩" },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const params = new URLSearchParams(location.search);
  const amount = Number(params.get("amount")) || 0;
  const description = params.get("description") || "Paiement";
  const orderId = params.get("order_id") || null;
  const type = params.get("type") || "product";

  const [payerPhone, setPayerPhone] = useState("");
  const [payerCountry, setPayerCountry] = useState("CM");
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (payerPhone.trim().length < 6) {
      toast.error("Numéro de téléphone invalide");
      return;
    }
    setLoading(true);

    const { data: txData, error: txError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: user.id,
        order_id: orderId || null,
        payer_phone: payerPhone,
        payer_country: countries.find((c) => c.code === payerCountry)?.name || "Cameroun",
        amount,
        description,
        status: "pending",
      })
      .select("id")
      .single();

    if (txError) {
      toast.error("Erreur lors de la création de la transaction");
      setLoading(false);
      return;
    }

    const res = await initiatePayment({
      amount,
      reference: txData?.id,
      description,
    });

    if (!res.success) {
      await supabase
        .from("payment_transactions")
        .update({ status: "failed" })
        .eq("id", txData?.id);

      await supabase.from("user_activity").insert({
        user_id: user.id,
        action: "payment_failed",
        detail: `${description} - ${amount} FCFA`,
      });

      toast.error(res.error || "Paiement indisponible. Vous pouvez réessayer.");
      setSuccess(true);
      setLoading(false);
      return;
    }

    await supabase
      .from("payment_transactions")
      .update({ status: "success" })
      .eq("id", txData?.id);

    if (orderId) {
      await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
    }

    await supabase.from("user_activity").insert({
      user_id: user.id,
      action: "payment_success",
      detail: `${description} - ${amount} FCFA`,
    });

    toast.success("Paiement effectué avec succès !");
    setSuccess(true);
    setLoading(false);
  };

  const paymentMethods = [
    { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
    { value: "orange_money", label: "Orange Money", icon: Wallet },
    { value: "card", label: "Carte bancaire", icon: CreditCard },
  ];

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 pt-16 space-y-6">
        <div className="text-center space-y-4 animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Paiement confirmé</h1>
            <p className="text-muted-foreground text-sm mt-1">Votre paiement de {amount.toLocaleString()} FCFA a été traité avec succès.</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Description</span>
              <span className="font-medium">{description}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant</span>
              <span className="font-bold text-primary">{amount.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Numéro payeur</span>
              <span className="font-medium">{payerPhone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pays</span>
              <span className="font-medium">{countries.find((c) => c.code === payerCountry)?.name}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/transactions")}>
              Voir mes paiements
            </Button>
            <Button className="flex-1" onClick={() => navigate("/")}>
              Accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-12 space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Paiement</h1>
        <p className="text-sm text-muted-foreground">Finalisez votre achat en toute sécurité</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Montant à payer</p>
              <p className="text-3xl font-extrabold text-primary mt-1">{amount.toLocaleString()} <span className="text-lg font-bold">FCFA</span></p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Shield className="h-3 w-3 mr-1" /> Sécurisé
            </Badge>
          </div>
          <div className="mt-3 pt-3 border-t border-primary/10">
            <p className="text-sm font-medium text-foreground">{description}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Type: {type === "sms" ? "Pack SMS" : type === "coaching" ? "Coaching" : "Produit"}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handlePay} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" /> Informations du payeur
            </CardTitle>
            <CardDescription className="text-xs">Renseignez vos coordonnées de paiement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone du payeur</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="6XX XXX XXX"
                value={payerPhone}
                onChange={(e) => setPayerPhone(e.target.value)}
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Select value={payerCountry} onValueChange={setPayerCountry}>
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="mr-2">{c.flag}</span> {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Méthode de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {paymentMethods.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentMethod === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium flex-1 text-left">{label}</span>
                  {paymentMethod === value && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <Shield className="h-4 w-4 text-success shrink-0" />
          <span>Vos informations de paiement sont chiffrées et sécurisées. Nous ne stockons jamais vos données bancaires.</span>
        </div>

        <Button type="submit" size="lg" className="w-full text-base font-semibold" disabled={loading || amount <= 0}>
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Traitement en cours...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" /> Payer {amount.toLocaleString()} FCFA
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default CheckoutPage;
