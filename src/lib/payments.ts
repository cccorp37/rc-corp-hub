import { supabase } from "@/integrations/supabase/client";

export interface InitiatePaymentInput {
  amount: number;
  reference?: string;
  description?: string;
}

/**
 * Lance un paiement avec la passerelle choisie par l'administrateur.
 * L'utilisateur ne voit jamais quelle passerelle est utilisée.
 */
export const initiatePayment = async (input: InitiatePaymentInput) => {
  const { data, error } = await supabase.functions.invoke("initiate-payment", {
    body: input,
  });

  if (error) {
    return { success: false, error: "Paiement indisponible pour le moment." };
  }
  if (data?.error) {
    return { success: false, error: data.error as string };
  }

  if (data?.redirect_url) {
    window.location.href = data.redirect_url as string;
  }
  return { success: true };
};
