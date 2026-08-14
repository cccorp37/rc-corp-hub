import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CircleCheck as CheckCircle2, Copy, Info, LockKeyhole, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

const countries = ["Cameroun", "Côte d’Ivoire", "Sénégal", "Bénin", "Togo", "Gabon", "Mali", "Burkina Faso"];
const methods = [{ code: "orange_money", name: "Orange Money", tone: "orange" }, { code: "mtn_money", name: "MTN Money", tone: "yellow" }];

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [method, setMethod] = useState("orange_money");
  const [country, setCountry] = useState("Cameroun");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(params.get("amount") || "");
  const [description, setDescription] = useState(params.get("description") || "Paiement de service Neko");
  const [reference, setReference] = useState("");
  const [submitted, setSubmitted] = useState<{ reference: string; amount: string; method: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 100) { toast.error("Saisissez un montant minimum de 100 FCFA."); return; }
    if (!/^\+?[0-9 ()-]{8,20}$/.test(phone)) { toast.error("Saisissez un numéro mobile valide."); return; }
    if (!supabase) { toast.error("Le service de paiement est momentanément indisponible."); return; }
    setBusy(true);
    const generatedReference = reference.trim() || `NEKO-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("payment_transactions").insert({ amount: numericAmount, payer_phone: phone.trim(), payer_country: country, gateway_code: method, description: description.trim(), status: "pending", reference: generatedReference });
    setBusy(false);
    if (error) { console.error("payment request failed", error); toast.error("La demande n’a pas pu être enregistrée."); return; }
    setSubmitted({ reference: generatedReference, amount: numericAmount.toLocaleString("fr-FR"), method: methods.find(item => item.code === method)?.name || method });
  };

  if (submitted) return <div className="app-shell"><header className="topbar"><Link to="/" className="brand"><img src="/neko-logo.svg" alt="Neko" /><span>Neko</span></Link></header><main className="payment-wrap"><section className="success-card"><div className="success-icon"><CheckCircle2 size={40} /></div><p className="eyebrow">Demande enregistrée</p><h1>Votre paiement est en attente de confirmation.</h1><p>Aucun montant n’a été débité automatiquement. Dès qu’une passerelle Orange Money ou MTN Money sera connectée, cette demande pourra être vérifiée et finalisée.</p><div className="reference-box"><span>Référence</span><strong>{submitted.reference}</strong><button onClick={() => { navigator.clipboard?.writeText(submitted.reference); toast.success("Référence copiée."); }} aria-label="Copier la référence"><Copy size={16} /></button></div><div className="summary-lines"><span>Montant<strong>{submitted.amount} FCFA</strong></span><span>Moyen<strong>{submitted.method}</strong></span></div><div className="action-row"><button className="secondary-button" onClick={() => navigate("/")}>Retour à l’accueil</button><button className="primary-button" onClick={() => setSubmitted(null)}>Nouvelle demande</button></div></section></main></div>;

  return <div className="app-shell"><header className="topbar"><Link to="/" className="brand"><img src="/neko-logo.svg" alt="Neko" /><span>Neko</span></Link><nav><span className="secure-label"><LockKeyhole size={14} /> Parcours sécurisé</span></nav></header><main className="payment-wrap"><Link to="/" className="back-link"><ArrowLeft size={16} /> Retour</Link><div className="payment-heading"><div><p className="eyebrow">Paiement de service</p><h1>Choisissez votre moyen de paiement</h1><p>Préparez vos informations Mobile Money. La passerelle sera branchée ultérieurement sans changer ce parcours.</p></div><img src="/neko-logo.svg" alt="Neko" /></div><form className="payment-grid" onSubmit={submit}><section className="payment-card"><div className="section-title"><span className="number">1</span><div><h2>Moyen de paiement</h2><p>Sélectionnez l’opérateur utilisé.</p></div></div><div className="method-grid">{methods.map(item => <button type="button" key={item.code} className={`method-option ${method === item.code ? `selected ${item.tone}` : ""}`} onClick={() => setMethod(item.code)}><span className={`method-mark ${item.tone}`}><Smartphone size={19} /></span><span><strong>{item.name}</strong><small>Paiement mobile</small></span><span className="radio-dot" /></button>)}</div><div className="field-row"><label>Pays<select value={country} onChange={e => setCountry(e.target.value)}>{countries.map(item => <option key={item}>{item}</option>)}</select></label><label>Numéro mobile<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="6 00 00 00 00" inputMode="tel" required /></label></div></section><section className="payment-card"><div className="section-title"><span className="number">2</span><div><h2>Détails de la demande</h2><p>Ces informations seront enregistrées pour le suivi.</p></div></div><label>Montant à payer (FCFA)<input type="number" min="100" step="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="25 000" required /></label><label>Description<input value={description} onChange={e => setDescription(e.target.value)} placeholder="Nom du service" required /></label><label>Référence existante <span className="optional">(facultatif)</span><input value={reference} onChange={e => setReference(e.target.value)} placeholder="Laissez vide pour en générer une" /></label><div className="notice"><Info size={17} /><span>Pour le moment, cette page crée une demande « en attente ». Aucun débit réel n’est effectué avant la connexion d’une passerelle officielle.</span></div><button className="primary-button submit-button" disabled={busy}>{busy ? "Enregistrement..." : "Enregistrer ma demande"}<ArrowLeft size={17} className="rotate-180" /></button></section></form></main></div>;
}
