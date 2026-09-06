import html2canvas from 'html2canvas';
import type { Ticket } from '../types';

function buildReceiptHtml(ticket: Ticket): string {
  const ticketUrl = `${window.location.origin}/ingresso/${ticket.code}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticketUrl)}`;

  const rows = [
    ['Comprador', ticket.buyer_name],
    ['Lote', ticket.lot_name],
    ['Data', ticket.event_date],
    ['Horário', ticket.event_time],
    ['Local', ticket.event_location],
  ]
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 0;color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:2px;text-transform:uppercase;width:90px;font-family:Helvetica,Arial,sans-serif;">${label}</td>
        <td style="padding:10px 0;color:rgba(255,255,255,0.85);font-size:13px;font-family:Helvetica,Arial,sans-serif;">${value}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;">
  <div id="receipt" style="width:400px;padding:0;background:#080808;font-family:Georgia,serif;">
    <div style="background:linear-gradient(135deg,#1a1400,#0f0f0f);padding:36px 32px 28px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.15);">
      <h1 style="margin:0;font-size:38px;color:#c9a84c;font-family:Georgia,serif;font-style:italic;letter-spacing:1px;">Lux House</h1>
      <p style="margin:6px 0 0;font-size:9px;letter-spacing:4px;color:rgba(201,168,76,0.4);text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;">Casa de Show</p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 4px;color:#ffffff;font-size:16px;text-align:center;font-family:Helvetica,Arial,sans-serif;letter-spacing:1px;">COMPROVANTE DE COMPRA</h2>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.35);font-size:10px;text-align:center;font-family:Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">Ingresso Digital</p>
      <div style="background:#1a1a1a;border:1px solid rgba(201,168,76,0.15);border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
      </div>
      <div style="text-align:center;margin-bottom:20px;">
        <img src="${qrApiUrl}" width="180" height="180" style="border-radius:8px;border:1px solid rgba(201,168,76,0.1);" />
      </div>
      <div style="text-align:center;margin-bottom:8px;">
        <div style="font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.2);text-transform:uppercase;margin-bottom:6px;font-family:Helvetica,Arial,sans-serif;">Codigo do Ingresso</div>
        <div style="font-family:Courier,monospace;font-size:22px;color:#c9a84c;letter-spacing:4px;font-weight:bold;">${ticket.code}</div>
      </div>
    </div>
    <div style="padding:18px 32px;border-top:1px solid rgba(201,168,76,0.08);text-align:center;">
      <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.15);line-height:1.6;font-family:Helvetica,Arial,sans-serif;">
        Apresente este QR Code na entrada do evento. Documento com foto obrigatorio.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function generateReceiptImage(ticket: Ticket): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  container.innerHTML = buildReceiptHtml(ticket);
  document.body.appendChild(container);

  const receiptEl = container.querySelector('#receipt') as HTMLElement;

  try {
    const canvas = await html2canvas(receiptEl, {
      scale: 3,
      backgroundColor: '#080808',
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `comprovante-${ticket.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    document.body.removeChild(container);
  }
}
