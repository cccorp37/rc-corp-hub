import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Filter } from "lucide-react";
import { toast } from "sonner";
import { initiatePayment } from "@/lib/payments";

const categories = ["Tous", "ebook", "billet", "ordinateur"];

const MarketplacePage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").eq("is_published", true).order("created_at", { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tous" || p.category === category;
    return matchSearch && matchCat;
  });

  const handleOrder = async (product: any) => {
    if (!user) return;
    const { data, error } = await supabase.from("orders").insert({
      user_id: user.id,
      product_id: product.id,
      amount: product.price,
      status: "pending",
    }).select("id").single();
    if (error) {
      toast.error("Erreur lors de la commande");
      return;
    }
    toast.success("Commande enregistrée, redirection vers le paiement...");
    const res = await initiatePayment({
      amount: product.price,
      reference: data?.id,
      description: product.title,
    });
    if (!res.success) {
      toast.error(res.error || "Paiement indisponible");
      if (product.redirect_url) window.open(product.redirect_url, "_blank");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold text-foreground">Marketplace</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat === "Tous" ? "Tous" : cat.charAt(0).toUpperCase() + cat.slice(1) + "s"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border rounded-xl p-3 animate-pulse">
              <div className="bg-muted h-32 rounded-lg mb-3" />
              <div className="bg-muted h-4 rounded w-3/4 mb-2" />
              <div className="bg-muted h-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-muted flex items-center justify-center">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-3 space-y-2">
                <p className="font-medium text-sm text-foreground line-clamp-1">{p.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-primary">{p.price.toLocaleString()} FCFA</span>
                </div>
                <Button size="sm" className="w-full text-xs" onClick={() => handleOrder(p)}>
                  Acheter
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
