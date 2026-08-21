import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Zap } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

const faqs = [
  {
    q: 'Como funciona o ingresso digital?',
    a: 'Apos a confirmacao do pagamento via Pix, voce recebera automaticamente um e-mail com seu ingresso digital contendo QR Code exclusivo. Apresente o QR Code na entrada do evento para validacao.',
  },
  {
    q: 'O Pix e o unico meio de pagamento aceito?',
    a: 'Sim. Para garantir agilidade, seguranca e confirmar instantaneamente seu ingresso, trabalhamos exclusivamente com pagamento via Pix atraves do Mercado Pago.',
  },
  {
    q: 'Qual e o prazo para pagamento apos selecionar o ingresso?',
    a: 'Apos a geracao do QR Code Pix, voce tem 30 minutos para realizar o pagamento. Apos esse periodo, o pedido e cancelado automaticamente e o ingresso retorna ao estoque.',
  },
  {
    q: 'Posso transferir meu ingresso para outra pessoa?',
    a: 'Ingressos sao nominais (vinculados ao CPF informado no momento da compra) e nao sao transferiveis. Em caso de duvidas, entre em contato com nossa equipe.',
  },
  {
    q: 'O evento tem classificacao etaria?',
    a: 'A Lux House é um evento para maiores de 15 anos. Documento oficial com foto sera exigido na entrada.',
  },
  {
    q: 'Quais sao as diferencas entre os lotes?',
    a: 'Cada lote representa uma faixa de preco diferente para o mesmo evento. O Lote 1 e o mais economico e tem quantidade limitada. Conforme os lotes se esgotam, o preco aumenta. Garante logo o seu!',
  },
  {
    q: 'Posso receber meu ingresso novamente por e-mail?',
    a: 'Sim. Caso nao tenha recebido ou tenha perdido o e-mail, acesse a pagina do seu ingresso pelo link enviado. Para reenvio, entre em contato com nosso suporte.',
  },
];

function FAQItem({ q, a, isOpen, onToggle, index, isMobile }: { q: string; a: string; isOpen: boolean; onToggle: () => void; index: number; isMobile: boolean }) {
  const accent = index % 3 === 0 ? '#FF5A00' : index % 3 === 1 ? '#8B5CF6' : '#38BDF8';

  return (
    <motion.div
      initial={false}
      className="border-b border-white/5 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-6 px-6 sm:px-8 text-left group"
      >
        <div className="flex items-start gap-4">
          <div
            className="shrink-0 mt-0.5 transition-all duration-300"
            style={{ color: isOpen ? accent : 'rgba(255,255,255,0.2)' }}
          >
            <HelpCircle size={18} />
          </div>
          <span
            className="text-sm sm:text-base transition-colors duration-300"
            style={{ color: isOpen ? '#fff' : 'rgba(255,255,255,0.65)' }}
          >
            {q}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ color: isOpen ? accent : 'rgba(255,255,255,0.25)' }}
        >
          <ChevronDown size={20} />
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
            <p className="text-sm sm:text-base text-white/40 leading-relaxed pb-6 px-6 sm:px-8 pl-14 sm:pl-16">
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
    <section id="faq" className="py-24 sm:py-32 lg:py-40 px-4 sm:px-6 relative bg-dark-950">
      {/* Neon background effects - hidden on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-pink-500/5 blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[200px]" />
        </div>
      )}

      {/* Decorative lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 lg:mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <Zap size={16} className="text-pink-400" style={{ filter: isMobile ? 'none' : 'drop-shadow(0 0 8px #FF5A00)' }} />
            <span className="text-[10px] tracking-[0.5em] text-pink-400/80 uppercase font-medium">Duvidas</span>
            <Zap size={16} className="text-purple-400" style={{ filter: isMobile ? 'none' : 'drop-shadow(0 0 8px #8B5CF6)' }} />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-tight">
            PERGUNTAS{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FF5A00 0%, #FF8A33 40%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              FREQUENTES
            </span>
          </h2>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: isMobile ? 0 : 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(9, 9, 9, 0.6)',
            border: '1px solid rgba(255, 90, 0, 0.15)',
            boxShadow: isMobile ? 'none' : '0 0 40px rgba(255, 90, 0, 0.1)',
          }}
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              index={i}
              isMobile={isMobile}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
});

export default FAQSection;
