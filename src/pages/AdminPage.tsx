import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BarChart3, Package, Bell, Users, MessageSquare, Store, BookOpen, ArrowLeft, Trash2, Edit, Plus, CreditCard, Check } from "lucide-react";

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  // Stats
  const [stats, setStats] = useState({ users: 0, orders: 0, campaigns: 0, coaching: 0, shops: 0 });
  
  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [pTitle, setPTitle] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState(0);
  const [pCategory, setPCategory] = useState("ebook");
  const [pImageUrl, setPImageUrl] = useState("");
  const [pRedirectUrl, setPRedirectUrl] = useState("");
  const [pPublished, setPPublished] = useState(false);

  // Notifications
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifTarget, setNotifTarget] = useState("all");

  // Lists
  const [coachingSessions, setCoachingSessions] = useState<any[]>([]);
  const [shopRequests, setShopRequests] = useState<any[]>([]);
  const [smsCampaigns, setSmsCampaigns] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Passerelles de paiement (admin uniquement)
  const [gateways, setGateways] = useState<any[]>([]);
  const [activeGatewayId, setActiveGatewayId] = useState<string | null>(null);
  const [gwName, setGwName] = useState("");
  const [gwCode, setGwCode] = useState("");
  const [gwCheckoutUrl, setGwCheckoutUrl] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    const [usersRes, ordersRes, campaignsRes, coachingRes, shopsRes, productsRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("sms_campaigns").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("coaching_sessions").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("shop_requests").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
    ]);
    setStats({
      users: usersRes.count || 0,
      orders: ordersRes.data?.length || 0,
      campaigns: campaignsRes.data?.length || 0,
      coaching: coachingRes.data?.length || 0,
      shops: shopsRes.data?.length || 0,
    });
    setOrders(ordersRes.data || []);
    setSmsCampaigns(campaignsRes.data || []);
    setCoachingSessions(coachingRes.data || []);
    setShopRequests(shopsRes.data || []);
    setProducts(productsRes.data || []);
    fetchPaymentConfig();
  };

  const db = supabase as any;

  const fetchPaymentConfig = async () => {
    const [gwRes, settingsRes] = await Promise.all([
      db.from("payment_gateways").select("*").order("name"),
      db.from("payment_settings").select("*").maybeSingle(),
    ]);
    setGateways(gwRes.data || []);
    setActiveGatewayId(settingsRes.data?.active_gateway_id ?? null);
  };

  const handleSelectGateway = async (id: string) => {
    const { error } = await db.from("payment_settings").update({ active_gateway_id: id }).eq("singleton", true);
    if (error) return toast.error("Impossible de définir la passerelle");
    setActiveGatewayId(id);
    toast.success("Passerelle de paiement activée");
  };

  const handleToggleGateway = async (id: string, enabled: boolean) => {
    await db.from("payment_gateways").update({ is_enabled: enabled }).eq("id", id);
    fetchPaymentConfig();
  };

  const handleAddGateway = async () => {
    if (!gwName || !gwCode) return;
    const { error } = await db.from("payment_gateways").insert({
      name: gwName,
      code: gwCode,
      config: gwCheckoutUrl ? { checkout_url: gwCheckoutUrl } : {},
    });
    if (error) return toast.error("Erreur lors de l'ajout");
    setGwName(""); setGwCode(""); setGwCheckoutUrl("");
    toast.success("Passerelle ajoutée");
    fetchPaymentConfig();
  };

  const handleDeleteGateway = async (id: string) => {
    await db.from("payment_gateways").delete().eq("id", id);
    toast.success("Passerelle supprimée");
    fetchPaymentConfig();
  };

  const resetProductForm = () => {
    setEditProduct(null); setPTitle(""); setPDesc(""); setPPrice(0); setPCategory("ebook"); setPImageUrl(""); setPRedirectUrl(""); setPPublished(false);
  };

  const handleSaveProduct = async () => {
    setLoading(true);
    const data = { title: pTitle, description: pDesc, price: pPrice, category: pCategory, image_url: pImageUrl, redirect_url: pRedirectUrl, is_published: pPublished };
    if (editProduct) {
      await supabase.from("products").update(data).eq("id", editProduct.id);
      toast.success("Produit mis à jour");
    } else {
      await supabase.from("products").insert(data);
      toast.success("Produit créé");
    }
    resetProductForm();
    fetchAll();
    setLoading(false);
  };

  const handleDeleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast.success("Produit supprimé");
    fetchAll();
  };

  const startEditProduct = (p: any) => {
    setEditProduct(p); setPTitle(p.title); setPDesc(p.description); setPPrice(p.price); setPCategory(p.category); setPImageUrl(p.image_url); setPRedirectUrl(p.redirect_url); setPPublished(p.is_published);
    setTab("products");
  };

  const handleSendNotification = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("notifications").insert({ title: notifTitle, body: notifBody, target: notifTarget, sent_by: user.id });
    if (error) toast.error("Erreur d'envoi");
    else {
      toast.success("Notification envoyée !");
      setNotifTitle(""); setNotifBody("");
    }
    setLoading(false);
  };

  const statCards = [
    { label: "Utilisateurs", value: stats.users, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Commandes", value: stats.orders, icon: Package, color: "text-green-600 bg-green-50" },
    { label: "Campagnes SMS", value: stats.campaigns, icon: MessageSquare, color: "text-orange-600 bg-orange-50" },
    { label: "Coaching", value: stats.coaching, icon: BookOpen, color: "text-purple-600 bg-purple-50" },
    { label: "Boutiques", value: stats.shops, icon: Store, color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Administration</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="products"><Package className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="notifs"><Bell className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="data"><Users className="h-4 w-4" /></TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-card border rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-4 space-y-4">
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-sm">{editProduct ? "Modifier" : "Ajouter"} un produit</h3>
            <div className="space-y-2">
              <Input placeholder="Titre" value={pTitle} onChange={(e) => setPTitle(e.target.value)} />
              <Textarea placeholder="Description" value={pDesc} onChange={(e) => setPDesc(e.target.value)} rows={2} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Prix (FCFA)" value={pPrice || ""} onChange={(e) => setPPrice(Number(e.target.value))} />
                <Select value={pCategory} onValueChange={setPCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ebook">Ebook</SelectItem>
                    <SelectItem value="billet">Billet</SelectItem>
                    <SelectItem value="ordinateur">Ordinateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="URL image" value={pImageUrl} onChange={(e) => setPImageUrl(e.target.value)} />
              <Input placeholder="URL de redirection post-achat" value={pRedirectUrl} onChange={(e) => setPRedirectUrl(e.target.value)} />
              <div className="flex items-center gap-2">
                <Switch checked={pPublished} onCheckedChange={setPPublished} />
                <Label className="text-sm">Publié</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSaveProduct} disabled={loading || !pTitle}>
                {editProduct ? "Mettre à jour" : "Ajouter"}
              </Button>
              {editProduct && (
                <Button variant="outline" onClick={resetProductForm}>Annuler</Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="bg-card border rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.price.toLocaleString()} FCFA • {p.is_published ? "Publié" : "Brouillon"}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEditProduct(p)} className="p-2 text-muted-foreground hover:text-foreground">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifs" className="mt-4">
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-sm">Envoyer une notification</h3>
            <Input placeholder="Titre" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} />
            <Textarea placeholder="Message" value={notifBody} onChange={(e) => setNotifBody(e.target.value)} rows={3} />
            <Select value={notifTarget} onValueChange={setNotifTarget}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                <SelectItem value="segment">Segment</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={handleSendNotification} disabled={loading || !notifTitle || !notifBody}>
              {loading ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="data" className="mt-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Demandes de coaching</h3>
            {coachingSessions.map((s) => (
              <div key={s.id} className="bg-card border rounded-xl p-3">
                <p className="text-sm font-medium">{s.module}</p>
                <p className="text-xs text-muted-foreground">{s.hours}h • {s.total_amount?.toLocaleString()} FCFA • {s.status}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Demandes de boutique</h3>
            {shopRequests.map((s) => (
              <div key={s.id} className="bg-card border rounded-xl p-3">
                <p className="text-sm font-medium">{s.platform_type} ({s.platform_support})</p>
                <p className="text-xs text-muted-foreground">{s.business_domain} • {s.status}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Campagnes SMS</h3>
            {smsCampaigns.map((c) => (
              <div key={c.id} className="bg-card border rounded-xl p-3">
                <p className="text-sm font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.recipients?.length || 0} dest. • {c.status}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
