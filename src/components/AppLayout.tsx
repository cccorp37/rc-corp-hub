import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Chrome as Home, ShoppingBag, MessageSquare, Briefcase, User, LogOut, CreditCard, Heart, Activity, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/", icon: Home, label: "Accueil" },
  { to: "/marketplace", icon: ShoppingBag, label: "Boutique" },
  { to: "/sms", icon: MessageSquare, label: "SMS" },
  { to: "/services", icon: Briefcase, label: "Services" },
  { to: "/favorites", icon: Heart, label: "Favoris" },
  { to: "/transactions", icon: CreditCard, label: "Paiements" },
  { to: "/activity", icon: Activity, label: "Activité" },
  { to: "/profile", icon: User, label: "Profil" },
];

const AppLayout = () => {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border/60">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <span className="text-white font-extrabold text-sm tracking-tight">RC</span>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sidebar-foreground text-sm tracking-tight">RC-CORP</p>
          <p className="text-[10px] text-sidebar-foreground/60 font-medium">Plateforme Pro</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-sidebar-primary text-white shadow-md shadow-primary/30"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mt-2 border-t border-sidebar-border/40 pt-3 ${
                isActive
                  ? "bg-sidebar-primary text-white shadow-md shadow-primary/30"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`
            }
          >
            <CreditCard className="h-[18px] w-[18px] shrink-0" />
            <span>Administration</span>
          </NavLink>
        )}
      </nav>

      <div className="px-3 py-3 border-t border-sidebar-border/60">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">
              {(profile?.first_name?.[0] || "U").toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {profile?.first_name || "Utilisateur"} {profile?.last_name}
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">
              {profile?.sms_balance || 0} SMS disponibles
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-red-300 transition-all"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-sidebar flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-sidebar flex-col z-50 animate-slide-in-left">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 text-sidebar-foreground/60 hover:text-sidebar-foreground p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-sidebar px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-sidebar-foreground p-1 -ml-1"
            aria-label="Ouvrir le menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center">
              <span className="text-white font-extrabold text-[10px]">RC</span>
            </div>
            <span className="text-sidebar-foreground font-bold text-sm">RC-CORP</span>
          </div>
          <div className="w-6" />
        </div>

        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
