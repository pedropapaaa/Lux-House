import { useState, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  ['Como funciona o ingresso digital?', 'Após a confirmação do pagamento via Pix, você receberá automaticamente um e-mail com seu ingresso digital e QR Code exclusivo.'],
  ['O Pix é o único meio de pagamento aceito?', 'Sim. Para garantir agilidade e confirmação instantânea, trabalhamos exclusivamente com pagamento via Pix através do Mercado Pago.'],
  ['Qual é o prazo para pagamento?', 'Após a geração do QR Code Pix, você tem 30 minutos para realizar o pagamento. Depois disso, o pedido é cancelado automaticamente.'],
  ['Posso transferir meu ingresso?', 'Os ingressos são nominais e vinculados ao CPF informado na compra. Em caso de dúvidas, entre em contato com nossa equipe.'],
  ['O evento tem classificação etária?', 'A Lux House é um evento para maiores de 15 anos. Documento oficial com foto será exigido na entrada.'],
  ['Quais são as diferenças entre os lotes?', 'Cada lote tem uma faixa de preço diferente para o mesmo evento. O primeiro lote é o mais econômico e tem quantidade limitada.'],
  ['Posso receber meu ingresso novamente?', 'Sim. Acesse a página do seu ingresso pelo link enviado ou entre em contato com nosso suporte para solicitar o reenvio.'],
];

const FAQSection = memo(function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section id="faq" className="bg-white text-neutral-950">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-10 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24 lg:px-16">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">03 / Dúvidas</p><h2 className="mt-5 max-w-[7ch] font-display text-6xl font-black uppercase leading-[0.86] tracking-[-0.06em] sm:text-8xl">Antes da noite.</h2><p className="mt-6 max-w-xs text-sm leading-6 text-neutral-600">Perguntas frequentes sobre ingressos e o evento.</p></div>
        <div className="border-t border-neutral-950">{faqs.map(([question, answer], index) => { const isOpen = openIndex === index; return <div key={question} className="border-b border-neutral-200"><button type="button" onClick={() => setOpenIndex(isOpen ? null : index)} className="flex min-h-20 w-full items-center justify-between gap-8 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"><span className={`text-base transition-colors ${isOpen ? 'font-semibold text-neutral-950' : 'text-neutral-700'}`}>{question}</span><motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 text-2xl font-light text-neutral-500">⌄</motion.span></button><AnimatePresence initial={false}>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="max-w-2xl pb-6 pr-10 text-sm leading-6 text-neutral-600">{answer}</p></motion.div>}</AnimatePresence></div>; })}</div>
      </div>
    </section>
  );
});

export default FAQSection;
