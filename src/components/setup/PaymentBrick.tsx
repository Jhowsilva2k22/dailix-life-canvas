import { useState, useCallback } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { supabase } from "@/integrations/supabase/client";

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
}

interface PaymentBrickProps {
  userEmail: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onPending: () => void;
}

const PaymentBrick = ({ userEmail, onSuccess, onError, onPending }: PaymentBrickProps) => {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = useCallback(
    async (formData: any) => {
      setProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "create-mp-payment",
          {
            body: {
              token: formData.token,
              payment_method_id: formData.payment_method_id,
              installments: formData.installments,
              issuer_id: formData.issuer_id,
              payer: formData.payer,
            },
          }
        );

        if (error) {
          onError("Erro ao processar pagamento. Tente novamente.");
          return;
        }

        if (data.status === "approved") {
          onSuccess();
        } else if (data.status === "pending" || data.status === "in_process") {
          onPending();
        } else {
          onError(
            data.status_detail === "cc_rejected_other_reason"
              ? "Cartão recusado. Tente outro meio de pagamento."
              : "Pagamento não aprovado. Tente novamente."
          );
        }
      } catch (err) {
        console.error("Payment error:", err);
        onError("Erro inesperado. Tente novamente.");
      } finally {
        setProcessing(false);
      }
    },
    [onSuccess, onError, onPending]
  );

  const handleError = useCallback(
    (error: any) => {
      console.error("Brick error:", error);
      onError("Erro no formulário de pagamento.");
    },
    [onError]
  );

  if (!MP_PUBLIC_KEY) {
    return (
      <div className="rounded-xl p-5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          Pagamento em configuração. Tente novamente em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="mp-brick-container">
      <Payment
        initialization={{
          amount: 9.9,
          payer: { email: userEmail },
        }}
        customization={{
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: [],
            bankTransfer: [],
            atm: [],
            maxInstallments: 1,
          },
          visual: {
            style: {
              theme: "dark",
              customVariables: {
                formBackgroundColor: "rgba(12,18,34,0.95)",
                baseColor: "#00B4D8",
                textPrimaryColor: "rgba(255,255,255,0.85)",
                textSecondaryColor: "rgba(255,255,255,0.45)",
                inputBackgroundColor: "rgba(255,255,255,0.06)",
                inputBorderColor: "rgba(255,255,255,0.1)",
                borderRadiusLarge: "12px",
                borderRadiusMedium: "10px",
                borderRadiusSmall: "8px",
              } as any,
            },
            hideFormTitle: true,
            hidePaymentButton: false,
          },
        }}
        onSubmit={handleSubmit}
        onError={handleError}
      />
      {processing && (
        <div className="flex items-center justify-center mt-4">
          <div className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00B4D8", borderTopColor: "transparent" }} />
          <span className="ml-2 text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>Processando...</span>
        </div>
      )}
    </div>
  );
};

export default PaymentBrick;
