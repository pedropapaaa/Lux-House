import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, RefreshCw, Shield, Ticket, XCircle } from 'lucide-react';
import { useOrder } from '../hooks/useOrder';
import { useTicketByOrderId } from '../hooks/useTicket';
import QRCodeDisplay from '../components/payment/QRCodeDisplay';
import CountdownTimer from '../components/payment/CountdownTimer';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export default function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error, refetch } = useOrder(orderId, 5000);
  const isApproved = order?.payment_status === 'approved';
  const { data: ticket } = useTicketByOrderId(orderId, isApproved);

  useEffect(() => { if (isApproved && ticket?.code) navigate(`/ingresso/${ticket.code}`, { replace: true }); }, [isApproved, ticket?.code, navigate]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#f5f5f3]"><Spinner size={48} /></div>;
  if (error || !order) return <StatusScreen icon={AlertCircle} title="Pedido não encontrado" text="Verifique o link ou volte para a página inicial." action="Voltar ao início" />;
  if (order.payment_status === 'rejected' || order.payment_status === 'expired') return <StatusScreen icon={XCircle} title={order.payment_status === 'expired' ? 'Pagamento expirado' : 'Pagamento recusado'} text={order.payment_status === 'expired' ? 'O tempo para pagamento expirou. Volte ao início e tente novamente.' : 'O pagamento foi recusado. Tente novamente.'} action="Tentar novamente" />;
  if (isApproved) return <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f5f5f3] px-6 text-center"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-950 text-white"><CheckCircle2 size={44} /></div><h2 className="font-display text-3xl font-black uppercase tracking-[-0.05em]">Pagamento aprovado</h2><p className="text-sm text-neutral-500">Gerando seu ingresso...</p><Spinner size={32} /></div>;

  return <main className="min-h-screen bg-[#f5f5f3] px-4 py-10 text-neutral-950 sm:py-16"><div className="mx-auto max-w-lg"><motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center sm:mb-10"><Link to="/" className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-950"><img src="/images/monograma-lh.webp" alt="Lux House" className="h-12 w-12 invert" /></Link><div className="mx-auto inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2"><span className="h-2 w-2 animate-pulse rounded-full bg-neutral-950" /><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">Aguardando pagamento</span></div><h1 className="mt-6 font-display text-3xl font-black uppercase tracking-[-0.06em] sm:text-4xl">Finalize seu pagamento</h1><p className="mt-3 text-sm text-neutral-500">Escaneie o QR Code ou copie o código Pix para pagar.</p></motion.header>
    {order.expires_at && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-center"><div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-3 shadow-sm"><Clock size={17} /><CountdownTimer expiresAt={order.expires_at} onExpire={() => refetch()} /></div></motion.div>}
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5 rounded-[26px] border border-neutral-200 bg-white p-5 shadow-[0_20px_55px_rgba(0,0,0,0.08)] sm:p-7">{order.qr_code ? <QRCodeDisplay pixCode={order.qr_code} qrBase64={order.qr_code_base64} /> : <div className="flex flex-col items-center gap-4 py-12"><Spinner size={40} /><p className="text-sm text-neutral-500">Gerando QR Code...</p></div>}</motion.section>
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6 rounded-[22px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center gap-3 border-b border-neutral-200 pb-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-950 text-white"><Ticket size={15} /></span><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Resumo do pedido</span></div><div className="space-y-4 text-sm">{[{ label: 'Comprador', value: `${order.buyer_name} ${order.buyer_last_name}` }, { label: 'E-mail', value: order.buyer_email }, { label: 'Lote', value: (order.lots as { name?: string } | null)?.name ?? '—' }, { label: 'Valor', value: order.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), highlight: true }].map(({ label, value, highlight }) => <div key={label} className="flex items-center justify-between gap-4"><span className="text-xs text-neutral-500">{label}</span><span className={`max-w-[65%] truncate text-right ${highlight ? 'font-display text-xl font-bold text-neutral-950' : 'text-neutral-800'}`}>{value}</span></div>)}</div></motion.section>
    <div className="text-center"><button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500 transition hover:bg-white hover:text-neutral-950"><RefreshCw size={14} />Verificar pagamento</button><p className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-400"><Shield size={13} />Após o pagamento, seu ingresso será gerado automaticamente</p></div>
  </div></main>;
}

function StatusScreen({ icon: Icon, title, text, action }: { icon: typeof AlertCircle; title: string; text: string; action: string }) {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f5f5f3] px-6 text-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-950 text-white"><Icon size={36} /></div><h2 className="font-display text-3xl font-black uppercase tracking-[-0.05em]">{title}</h2><p className="max-w-sm text-sm leading-6 text-neutral-500">{text}</p><Link to="/"><Button variant="mono">{action}</Button></Link></div>;
}
