import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { User, Settings, HelpCircle, LogOut, Camera, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const faq = [
  { q: "Comment fonctionne le SMS Marketing ?", a: "Souscrivez un pack SMS, puis créez une campagne avec vos destinataires Orange Cameroun. Les SMS sont envoyés automatiquement." },
  { q: "Comment recharger ma carte UBA ?", a: "Accédez à Services > Recharge UBA, saisissez vos informations de carte et le montant souhaité." },
  { q: "Comment réserver une session de coaching ?", a: "Allez dans Services > Coaching, choisissez votre module et vos horaires. Le tarif est de 1 000 FCFA/heure." },
  { q: "Comment acheter sur la Marketplace ?", a: "Parcourez les produits, cliquez sur Acheter. Après paiement, vous serez redirigé vers le contenu." },
  { q: "Comment demander la création d'une boutique ?", a: "Remplissez le formulaire dans Services > Création Boutique. Notre équipe vous contactera." },
];

const ProfilePage = () => {
  const { user, profile, signOut, refreshProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setCountry(profile.country || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    supabase.from("notifications").select("*").order("sent_at", { ascending: false }).then(({ data }) => {
      if (data) setNotifications(data);
    });
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ first_name: firstName, last_name: lastName, country, phone }).eq("user_id", user.id);
    if (error) toast.error("Erreur de mise à jour");
    else {
      toast.success("Profil mis à jour !");
      await refreshProfile();
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Mon Profil</h1>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
            Admin
          </Button>
        )}
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-1" /> Profil</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1" /> Notifs</TabsTrigger>
          <TabsTrigger value="help"><HelpCircle className="h-4 w-4 mr-1" /> Aide</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <div className="bg-card border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center relative">
                {profile?.profile_photo ? (
                  <img src={profile.profile_photo} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-primary-foreground font-bold text-xl">
                    {(profile?.first_name?.[0] || "U").toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Prénom</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nom</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pays</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Cameroun" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Téléphone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237..." />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>

          <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Déconnexion
          </Button>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Aucune notification</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="bg-card border rounded-xl p-4">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(n.sent_at).toLocaleDateString("fr-FR")}</p>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="help" className="mt-4 space-y-4">
          <div className="bg-card border rounded-xl p-4">
            <h3 className="font-semibold mb-1">Contact Support</h3>
            <p className="text-sm text-muted-foreground">rcsystem33@gmail.com</p>
          </div>

          <div className="bg-card border rounded-xl p-4">
            <h3 className="font-semibold mb-3">FAQ</h3>
            <Accordion type="single" collapsible>
              {faq.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
