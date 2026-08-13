import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Heart, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const categories = ["Tous", "ebook", "billet", "ordinateur"];

const MarketplacePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"recent" | "price_low" | "price_high">("recent");

  useEffect(() => {
    fetchProducts();
    fetchFavorites();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", user.id);
    if (data) setFavorites(data.map((f) => f.product_id));
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) return;
    if (favorites.includes(productId)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
      setFavorites((prev) => prev.filter((id) => id !== productId));
      toast.success("Retiré des favoris");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
      setFavorites((prev) => [...prev, productId]);
      await supabase.from("user_activity").insert({
        user_id: user.id,
        action: "favorite",
        detail: "Ajout aux favoris",
      });
      toast.success("Ajouté aux favoris");
    }
  };

  const filtered = products
    .filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "Tous" || p.category === category;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sort === "price_low") return a.price - b.price;
      if (sort === "price_high") return b.price - a.price;
      return 0;
    });

  const handleBuy = (product: any) => {
    if (!user) return;
    navigate(`/checkout?amount=${product.price}&description=${encodeURIComponent(product.title)}&type=product`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-12 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Boutique</h1>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {filtered.length} produit{filtered.length > 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11" />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              category === cat
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat === "Tous" ? "Tous" : cat.charAt(0).toUpperCase() + cat.slice(1) + "s"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSort("recent")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${sort === "recent" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
        >
          Récents
        </button>
        <button
          onClick={() => setSort("price_low")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${sort === "price_low" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
        >
          Prix croissant
        </button>
        <button
          onClick={() => setSort("price_high")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${sort === "price_high" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
        >
          Prix décroissant
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border rounded-xl p-3 animate-pulse">
              <div className="bg-muted h-36 rounded-lg mb-3" />
              <div className="bg-muted h-4 rounded w-3/4 mb-2" />
              <div className="bg-muted h-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p, idx) => (
            <div
              key={p.id}
              className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="h-36 bg-muted relative overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
                <button
                  onClick={() => toggleFavorite(p.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white"
                >
                  <Heart
                    className={`h-4 w-4 transition-all ${
                      favorites.includes(p.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    }`}
                  />
                </button>
                <Badge className="absolute top-2 left-2 bg-primary/90 text-[10px] capitalize">
                  {p.category}
                </Badge>
              </div>
              <div className="p-3 space-y-2">
                <p className="font-semibold text-sm text-foreground line-clamp-1">{p.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-extrabold text-base text-primary">{p.price.toLocaleString()} <span className="text-xs">FCFA</span></span>
                </div>
                <Button size="sm" className="w-full group" onClick={() => handleBuy(p)}>
                  Acheter
                  <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
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
