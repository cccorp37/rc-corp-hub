import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const FavoritesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("favorites")
      .select("id, product_id, products(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setFavorites(data || []);
        setLoading(false);
      });
  }, [user]);

  const handleRemove = async (id: string) => {
    await supabase.from("favorites").delete().eq("id", id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    toast.success("Retiré des favoris");
  };

  const handleBuy = (product: any) => {
    navigate(`/checkout?amount=${product.price}&description=${encodeURIComponent(product.title)}&type=product`);
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border rounded-xl p-4 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Mes Favoris</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucun favori pour le moment</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/marketplace")}>
            Parcourir la boutique
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => {
            const p = fav.products;
            if (!p) return null;
            return (
              <div key={fav.id} className="bg-card border rounded-xl p-4 flex items-center gap-4 animate-fade-in hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{p.title}</p>
                  <p className="font-bold text-primary text-sm mt-0.5">{p.price.toLocaleString()} FCFA</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="default" onClick={() => handleBuy(p)}>
                    Acheter
                  </Button>
                  <button onClick={() => handleRemove(fav.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
