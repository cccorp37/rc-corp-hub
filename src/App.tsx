import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, Link } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { ArrowRight, CircleUserRound, LogOut, Menu, ShieldCheck, Smartphone } from "lucide-react";
import { Toaster, toast } from "sonner";
import PaymentPage from "./pages/PaymentPage";
import { isSupabaseConfigured, supabase } from "./integrations/supabase/client";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  if (checking) return <div className="loading-screen"><div className="spinner" /><span>Chargement de Neko...</span></div>;

  return <>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/payment" element={session ? <PaymentPage /> : <Navigate to="/login?next=/payment" replace />} />
        <Route path="/" element={session ? <HomePage onSignOut={() => setSession(null)} /> : <LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    <Toaster position="top-right" richColors />
  </>;
}

function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) { toast.error("La connexion est momentanément indisponible."); return; }
    setBusy(true);
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { first_name: name } } });
    setBusy(false);
    if (result.error) { toast.error("Impossible de valider ces informations."); return; }
    toast.success(mode === "login" ? "Bienvenue sur Neko." : "Compte créé. Vous pouvez maintenant continuer.");
  };

  return <main className="auth-shell">
    <section className="auth-art">
      <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
      <Link to="/" className="brand brand-on-dark"><img src="/neko-logo.svg" alt="Neko" /><span>Neko</span></Link>
      <div className="art-copy"><p className="eyebrow">L’Afrique avance avec vous</p><h1>Vos services numériques, réunis au même endroit.</h1><p>Payez vos services, suivez vos demandes et développez votre activité avec une expérience pensée pour le quotidien africain.</p></div>
      <div className="art-points"><span><ShieldCheck size={16} /> Transactions suivies</span><span><Smartphone size={16} /> Mobile Money prêt</span></div>
    </section>
    <section className="auth-panel">
      <div className="mobile-brand brand"><img src="/neko-logo.svg" alt="Neko" /><span>Neko</span></div>
      <div className="auth-heading"><p className="eyebrow">Espace client</p><h2>{mode === "login" ? "Ravi de vous revoir" : "Rejoignez Neko"}</h2><p>{mode === "login" ? "Connectez-vous pour continuer vers vos services." : "Créez votre compte et commencez en quelques secondes."}</p></div>
      <form onSubmit={submit} className="auth-form">
        {mode === "signup" && <label>Nom complet<input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" required /></label>}
        <label>Adresse email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required /></label>
        <label>Mot de passe<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Au moins 6 caractères" minLength={6} required /></label>
        <button className="primary-button" disabled={busy}>{busy ? "Vérification..." : mode === "login" ? "Se connecter" : "Créer mon compte"}<ArrowRight size={17} /></button>
      </form>
      <p className="switch-auth">{mode === "login" ? "Vous n'avez pas encore de compte ?" : "Vous avez déjà un compte ?"} <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Créer un compte" : "Se connecter"}</button></p>
    </section>
  </main>;
}

function HomePage({ onSignOut }: { onSignOut: () => void }) {
  const signOut = async () => { await supabase?.auth.signOut(); onSignOut(); };
  return <div className="app-shell"><header className="topbar"><Link to="/" className="brand"><img src="/neko-logo.svg" alt="Neko" /><span>Neko</span></Link><nav><Link to="/payment" className="nav-link">Paiements</Link><button className="icon-button" onClick={signOut} aria-label="Se déconnecter"><LogOut size={18} /></button></nav></header><main className="home-main"><section className="welcome-card"><div><p className="eyebrow">Neko Services Numériques</p><h1>Tout commence par une action simple.</h1><p>Choisissez votre moyen de paiement préféré pour enregistrer une demande de service.</p><Link to="/payment" className="primary-button inline-button">Ouvrir le paiement <ArrowRight size={17} /></Link></div><img src="/neko-logo.svg" alt="Logo Neko" /></section><section className="service-grid"><article><span className="service-icon blue"><Smartphone size={21} /></span><h3>Orange Money</h3><p>Préparez votre paiement mobile et gardez votre référence.</p></article><article><span className="service-icon yellow"><Smartphone size={21} /></span><h3>MTN Money</h3><p>Enregistrez facilement votre demande avec votre numéro mobile.</p></article><article><span className="service-icon dark"><ShieldCheck size={21} /></span><h3>Suivi transparent</h3><p>Chaque demande est conservée avec le statut « en attente ».</p></article></section></main></div>;
}

export default App;
