import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
        Segue o reenvio do seu ingresso para o Lux House.
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

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "https://riolounge.com.br";
    const emailFrom = Deno.env.get("EMAIL_FROM") ?? "ingressos@riolounge.com.br";

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { orderId } = await req.json() as { orderId: string };
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order
    const { data: order } = await supabase
      .from("orders")
      .select("*, lots(*)")
      .eq("id", orderId)
      .eq("payment_status", "approved")
      .maybeSingle();

    if (!order) {
      return new Response(JSON.stringify({ error: "Pedido aprovado não encontrado." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch ticket
    const { data: ticket } = await supabase
      .from("tickets")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (!ticket) {
      return new Response(JSON.stringify({ error: "Ingresso não encontrado para este pedido." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ticketUrl = `${appBaseUrl}/ingresso/${ticket.code}`;
    const html = emailTemplate({
      buyerName: order.buyer_name,
      ticketCode: ticket.code,
      lotName: ticket.lot_name,
      eventDate: ticket.event_date,
      eventTime: ticket.event_time,
      eventLocation: ticket.event_location,
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
        subject: "Reenvio do Seu Ingresso — Lux House",
        html,
      }),
    });

    if (!emailRes.ok) {
      const emailError = await emailRes.text();
      console.error("Resend error:", emailError);
      return new Response(JSON.stringify({ error: "Falha ao enviar e-mail." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sent: true, email: order.buyer_email }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("resend-ticket error:", e);
    return new Response(JSON.stringify({ error: "Erro interno." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
