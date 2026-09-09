import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function randomTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "RLIO-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function emailTemplate(params: {
  buyerName: string;
  ticketCode: string;
  lotName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketUrl: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Seu Ingresso - Lux House</title></head>
<body style="margin:0;padding:0;background:#080808;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:40px auto;background:#111111;border:1px solid rgba(201,168,76,0.2);border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#1a1400,#0f0f0f);padding:40px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.15);">
      <h1 style="margin:0;font-size:42px;color:#c9a84c;font-family:Georgia,serif;font-style:italic;">Lux House</h1>
      <p style="margin:8px 0 0;font-size:10px;letter-spacing:4px;color:rgba(201,168,76,0.4);text-transform:uppercase;">Casa de Show</p>
    </div>
    <div style="padding:40px;">
      <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">Olá, ${params.buyerName}!</h2>
      <p style="margin:0 0 32px;color:rgba(255,255,255,0.4);font-size:14px;line-height:1.6;">
        Seu pagamento foi confirmado. Aqui está seu ingresso para o evento.
      </p>
      <div style="background:#1a1a1a;border:1px solid rgba(201,168,76,0.15);border-radius:12px;padding:24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          ${[
            ["Lote", params.lotName],
            ["Data", params.eventDate],
            ["Horário", params.eventTime],
            ["Local", params.eventLocation],
          ].map(([label, value]) => `
          <tr>
            <td style="padding:8px 0;color:rgba(255,255,255,0.3);font-size:11px;letter-spacing:2px;text-transform:uppercase;width:80px;">${label}</td>
            <td style="padding:8px 0;color:rgba(255,255,255,0.8);font-size:13px;">${value}</td>
          </tr>`).join("")}
        </table>
      </div>
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.2);text-transform:uppercase;margin-bottom:8px;">Código do Ingresso</div>
        <div style="font-family:monospace;font-size:22px;color:#c9a84c;letter-spacing:4px;font-weight:bold;">${params.ticketCode}</div>
      </div>
      <a href="${params.ticketUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#8b6914,#c9a84c);color:#080808;text-decoration:none;padding:16px;border-radius:50px;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">
        Ver Ingresso Digital
      </a>
    </div>
    <div style="padding:24px 40px;border-top:1px solid rgba(201,168,76,0.08);text-align:center;">
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);line-height:1.6;">
        Apresente este QR Code na entrada do evento. Documento com foto obrigatório.
        <br>Rio de Janeiro — <a href="https://riolounge.com.br" style="color:rgba(201,168,76,0.4);">riolounge.com.br</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "https://riolounge.com.br";
  const emailFrom = Deno.env.get("EMAIL_FROM") ?? "ingressos@riolounge.com.br";

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const payload = await req.json();

    // Log webhook
    await supabase.from("webhook_logs").insert({
      payload,
      payment_id: payload?.data?.id ? String(payload.data.id) : null,
      status: "received",
    });

    // MP sends { type: "payment", data: { id: "..." } }
    if (payload?.type !== "payment" || !payload?.data?.id) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentId = String(payload.data.id);

    if (!mpAccessToken) {
      console.error("MP_ACCESS_TOKEN not configured");
      return new Response(JSON.stringify({ error: "MP_ACCESS_TOKEN missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch payment details from MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpAccessToken}` },
    });

    if (!mpRes.ok) {
      console.error("Failed to fetch MP payment:", paymentId);
      return new Response(JSON.stringify({ error: "Failed to fetch payment" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpPayment = await mpRes.json();
    const status = mpPayment.status;
    const orderId = mpPayment.external_reference;

    if (!orderId) {
      console.error("No external_reference on payment", paymentId);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map MP status to our status
    const statusMap: Record<string, string> = {
      approved: "approved",
      rejected: "rejected",
      cancelled: "rejected",
      refunded: "rejected",
      charged_back: "rejected",
    };
    const newStatus = statusMap[status];

    if (!newStatus) {
      // pending, in_process, authorized — nothing to do yet
      await supabase
        .from("webhook_logs")
        .update({ status: `mp_${status}_ignored` })
        .eq("payload->>data->>id", paymentId);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order
    const { data: order } = await supabase
      .from("orders")
      .select("*, lots(*)")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) {
      console.error("Order not found for external_reference:", orderId);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency — skip if already processed
    if (order.payment_status === "approved" && newStatus === "approved") {
      return new Response(JSON.stringify({ received: true, skipped: "already_approved" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order status
    await supabase
      .from("orders")
      .update({ payment_status: newStatus, payment_id: paymentId })
      .eq("id", orderId);

    if (newStatus === "approved") {
      const lotName = (order.lots as any)?.name ?? "Ingresso";

      // Increment sold_quantity on the lot
      await supabase.rpc("increment_lot_sold", { lot_id: order.lot_id });

      // Generate unique ticket code (retry on collision)
      let ticketCode = "";
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = randomTicketCode();
        const { data: existing } = await supabase
          .from("tickets")
          .select("id")
          .eq("code", candidate)
          .maybeSingle();
        if (!existing) { ticketCode = candidate; break; }
      }

      if (!ticketCode) ticketCode = `RLIO-${Date.now()}`;

      const eventDate = "Sabádo, 18 de Julho de 2025";
      const eventTime = "21h00 — 03h30";
      const eventLocation = "Vinhedo — São Paulo, SP";

      // Insert ticket
      await supabase.from("tickets").insert({
        order_id: orderId,
        code: ticketCode,
        lot_name: lotName,
        buyer_name: `${order.buyer_name} ${order.buyer_last_name}`,
        buyer_email: order.buyer_email,
        event_date: eventDate,
        event_time: eventTime,
        event_location: eventLocation,
      });

      // Send email
      if (resendApiKey) {
        const ticketUrl = `${appBaseUrl}/ingresso/${ticketCode}`;
        const html = emailTemplate({
          buyerName: order.buyer_name,
          ticketCode,
          lotName,
          eventDate,
          eventTime,
          eventLocation,
          ticketUrl,
        });

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: emailFrom,
            to: [order.buyer_email],
            subject: `Seu Ingresso — Lux House`,
            html,
          }),
        });

        if (!emailRes.ok) {
          console.error("Resend error:", await emailRes.text());
        }
      } else {
        console.warn("RESEND_API_KEY not configured — email not sent.");
      }
    }

    return new Response(JSON.stringify({ received: true, status: newStatus }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mp-webhook error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
