import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function ok(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400, details?: unknown) {
  console.error("[create-payment] Error:", message, details ? JSON.stringify(details, null, 2) : "");
  return new Response(JSON.stringify({ error: message, details }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpAccessToken) {
      return err("MP_ACCESS_TOKEN nao configurado no ambiente.", 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { orderId } = body as { orderId: string };

    if (!orderId) return err("orderId is required");

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, lots(*)")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr || !order) return err("Pedido nao encontrado.", 404);
    if (order.payment_status !== "pending") return err("Este pedido ja foi processado.");

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const expiresAtISO = expiresAt.toISOString().replace("Z", "-03:00");

    const cleanCpf = order.buyer_cpf.replace(/\D/g, "");
    const lotName = (order.lots as any)?.name ?? "Ingresso";

    if (cleanCpf.length !== 11) {
      return err("CPF invalido. Deve conter 11 digitos.", 400, { cpf: order.buyer_cpf, cleaned: cleanCpf });
    }

    if (!order.buyer_email || !order.buyer_email.includes("@")) {
      return err("Email invalido.", 400, { email: order.buyer_email });
    }

    // Round to 2 decimal places — Mercado Pago requires exactly 2 decimals
    const amount = Math.round(Number(order.total_amount) * 100) / 100;
    if (isNaN(amount) || amount <= 0) {
      return err("Valor do pedido invalido.", 400, { total_amount: order.total_amount });
    }

    const mpPayload = {
      transaction_amount: amount,
      description: `Lux House - ${lotName}`,
      payment_method_id: "pix",
      external_reference: orderId,
      date_of_expiration: expiresAtISO,
      payer: {
        email: order.buyer_email,
        first_name: order.buyer_name,
        last_name: order.buyer_last_name,
        identification: {
          type: "CPF",
          number: cleanCpf,
        },
      },
    };

    console.log("[create-payment] Sending to MP:", JSON.stringify({ orderId, amount, lotName }));

    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpAccessToken}`,
        "X-Idempotency-Key": orderId,
      },
      body: JSON.stringify(mpPayload),
    });

    const mpResponseBody = await mpRes.text();
    console.log("[create-payment] MP Response status:", mpRes.status);

    if (!mpRes.ok) {
      let mpError: any;
      try { mpError = JSON.parse(mpResponseBody); } catch { mpError = { raw: mpResponseBody }; }
      const errorMessage = mpError?.message || mpError?.error || mpError?.cause?.[0]?.description || "Erro desconhecido";
      return err(`Mercado Pago erro (${mpRes.status}): ${errorMessage}`, 502, { mpError, requestPayload: mpPayload });
    }

    const mpData = JSON.parse(mpResponseBody);
    const paymentId = String(mpData.id);
    const qrCode = mpData.point_of_interaction?.transaction_data?.qr_code ?? null;
    const qrCodeBase64 = mpData.point_of_interaction?.transaction_data?.qr_code_base64 ?? null;

    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        payment_id: paymentId,
        qr_code: qrCode,
        qr_code_base64: qrCodeBase64,
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", orderId);

    if (updateErr) {
      return err("Erro ao salvar dados de pagamento.", 500, { dbError: updateErr });
    }

    return ok({ paymentId, qrCode, qrCodeBase64, expiresAt: expiresAt.toISOString() });
  } catch (e) {
    console.error("[create-payment] Exception:", e);
    return err(e instanceof Error ? e.message : "Erro interno.", 500, { exception: String(e) });
  }
});
