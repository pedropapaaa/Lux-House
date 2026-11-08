import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

const faqs = [
  {
    q: 'Como funciona o ingresso digital?',
    a: 'Após a confirmação do pagamento via Pix, você receberá automaticamente um e-mail com seu ingresso digital contendo QR Code exclusivo. Apresente o QR Code na entrada do evento para validação.',
  },
  {
    q: 'O Pix é o único meio de pagamento aceito?',
    a: 'Sim. Para garantir agilidade, segurança e confirmar instantaneamente seu ingresso, trabalhamos exclusivamente com pagamento via Pix através do Mercado Pago.',
  },
  {
    q: 'Qual é o prazo para pagamento após selecionar o ingresso?',
    a: 'Após a geração do QR Code Pix, você tem 30 minutos para realizar o pagamento. Após esse período, o pedido é cancelado automaticamente e o ingresso retorna ao estoque.',
  },
  {
    q: 'Posso transferir meu ingresso para outra pessoa?',
    a: 'Ingressos são nominais (vinculados ao CPF informado no momento da compra) e não são transferíveis. Em caso de dúvidas, entre em contato com nossa equipe.',
  },
  {
    q: 'O evento tem classificação etária?',
    a: 'A Lux House é um evento para maiores de 15 anos. Documento oficial com foto será exigido na entrada.',
  },
  {
    q: 'Quais são as diferenças entre os lotes?',
    a: 'Cada lote representa uma faixa de preço diferente para o mesmo evento. O Lote 1 é o mais econômico e tem quantidade limitada. Conforme os lotes se esgotam, o preço aumenta. Garanta logo o seu!',
  },
  {
    q: 'Posso receber meu ingresso novamente por e-mail?',
    a: 'Sim. Caso não tenha recebido ou tenha perdido o e-mail, acesse a página do seu ingresso pelo link enviado. Para reenvio, entre em contato com nosso suporte.',
  },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      initial={false}
      className="border-b border-white/8 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="w-full min-h-16 flex items-center justify-between gap-3 sm:gap-4 py-4 sm:py-5 px-4 sm:px-6 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="shrink-0 mt-0.5 transition-all duration-300 text-white/25">
            <HelpCircle size={16} className="sm:!size-4" />
          </div>
          <span
            className="text-xs sm:text-sm sm:text-base transition-colors duration-300"
            style={{ color: isOpen ? '#fff' : 'rgba(255,255,255,0.65)' }}
          >
            {q}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white/25"
        >
          <ChevronDown size={18} className="sm:!size-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-xs sm:text-sm sm:text-base text-white/40 leading-relaxed pb-4 sm:pb-6 px-4 sm:px-6 sm:px-8 pl-11 sm:pl-14 sm:pl-16">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const FAQSection = memo(function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  return (
    <section id="faq" className="relative py-20 sm:py-32 lg:py-40 px-4 sm:px-6 bg-[#0a0a0a] bw-grain overflow-hidden">
      <div className="absolute inset-0 bw-grid-lines opacity-30 pointer-events-none" />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-white/3 blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-white/3 blur-[200px]" />
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/40" />
            <span className="text-[10px] tracking-[0.5em] text-white/60 uppercase font-medium">Dúvidas</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/40" />
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: "'Anton', sans-serif" }}>
            Perguntas Frequentes
          </h2>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: isMobile ? 0 : 0.2 }}
          className="rounded-2xl overflow-hidden border border-white/12 bg-white/5 backdrop-blur-sm"
          style={{ boxShadow: isMobile ? 'none' : '0 0 40px rgba(255,255,255,0.05)' }}
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
});

export default FAQSection;
