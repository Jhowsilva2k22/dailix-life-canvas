import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

let mpInitialized = false;

interface PaymentBrickProps {
  userEmail: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onPending: () => void;
}

const PaymentBrick = ({ userEmail, onSuccess, onError, onPending }: PaymentBrickProps) => {
  const [processing, setProcessing] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Fetch public key and initialize SDK
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-mp-public-key");
        if (error || !data?.public_key) {
          console.error("Failed to fetch MP public key");
          return;
        }
        if (cancelled) return;

        setPublicKey(data.public_key);

        if (!mpInitialized) {
          const { initMercadoPago } = await import("@mercadopago/sdk-react");
          initMercadoPago(data.public_key, { locale: "pt-BR" });
          mpInitialized = true;
        }
        setSdkReady(true);
      } catch (err) {
        console.error("MP SDK init error:", err);
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = useCallback(
    async (formData: any) => {
      setProcessing(true);
      console.log("PaymentBrick raw payload:", JSON.stringify(formData, null, 2));

      // Defensive normalization: Brick may wrap data in formData/form_data/data
      const normalized = formData?.formData ?? formData?.form_data ?? formData?.data ?? formData;
      console.log("PaymentBrick normalized payload:", JSON.stringify(normalized, null, 2));

      const paymentMethodId = normalized?.payment_method_id;
      if (!paymentMethodId) {
        console.error("payment_method_id ausente após normalização", normalized);
        onError("Método de pagamento não identificado. Tente novamente.");
        setProcessing(false);
        return;
      }

      try {
        const idempotencyKey = crypto.randomUUID();
        const { data, error } = await supabase.functions.invoke(
          "create-mp-payment",
          {
            body: {
              token: normalized.token,
              payment_method_id: paymentMethodId,
              installments: normalized.installments,
              issuer_id: normalized.issuer_id,
              payer: normalized.payer,
              transaction_amount: normalized.transaction_amount,
              idempotency_key: idempotencyKey,
            },
          }
        );

        if (error) {
          console.error("Edge function error:", error);
          onError("Erro ao processar pagamento. Tente novamente.");
          return;
        }

        if (!data.success) {
          const detail = data.cause?.[0]?.description || data.error || "Erro desconhecido";
          console.error("MP payment error:", data);
          onError(detail);
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

  if (!sdkReady) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#00B4D8", borderTopColor: "transparent" }} />
        <span className="ml-3 text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>Carregando pagamento...</span>
      </div>
    );
  }

  // Dynamically render the Payment component after SDK is ready
  return <PaymentBrickInner
    userEmail={userEmail}
    onSubmit={handleSubmit}
    onError={handleError}
    processing={processing}
  />;
};

// Separate component to ensure Payment import happens after SDK init
const PaymentBrickInner = ({ userEmail, onSubmit, onError, processing }: {
  userEmail: string;
  onSubmit: (data: any) => void;
  onError: (error: any) => void;
  processing: boolean;
}) => {
  const [PaymentComponent, setPaymentComponent] = useState<any>(null);

  useEffect(() => {
    import("@mercadopago/sdk-react").then((mod) => {
      setPaymentComponent(() => mod.Payment);
    });
  }, []);

  if (!PaymentComponent) return null;

  return (
    <div className="mp-brick-container">
      <PaymentComponent
        initialization={{
          amount: 9.9,
          payer: { email: userEmail },
        }}
        customization={{
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: [] as any,
            bankTransfer: ["pix"] as any,
            atm: [] as any,
            maxInstallments: 1,
          },
          visual: {
            style: {
              theme: "dark" as const,
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
              },
            },
            hideFormTitle: true,
            hidePaymentButton: false,
          },
        }}
        onSubmit={onSubmit}
        onError={onError}
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
