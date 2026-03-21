import { NavLink, Outlet } from "react-router-dom";
import { Home, ShoppingBag, MessageSquare, Briefcase, User } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Accueil" },
  { to: "/marketplace", icon: ShoppingBag, label: "Boutique" },
  { to: "/sms", icon: MessageSquare, label: "SMS" },
  { to: "/services", icon: Briefcase, label: "Services" },
  { to: "/profile", icon: User, label: "Profil" },
];

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
