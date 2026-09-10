import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ScanLine, DollarSign,
  Sparkles, LogOut, Menu, X, ShieldCheck, Activity,
  UserCheck, Brain, CalendarDays,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useIsMobile } from '../../hooks/useIsMobile';
import { EventSelector } from './EventSelector';

interface NavItem {
  to: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { to: '/admin/dashboard', label: 'Início', description: 'Visão geral do evento.', icon: LayoutDashboard },
  { to: '/admin/participantes', label: 'Participantes', description: 'Veja quem entrou e quem ainda falta entrar.', icon: UserCheck },
  { to: '/admin/evento', label: 'Modificar evento', description: 'Atualize os dados do evento selecionado.', icon: CalendarDays },
  { to: '/admin/live', label: 'Ao Vivo', description: 'Acompanhe o evento em tempo real.', icon: Activity },
  { to: '/admin/checkin', label: 'Check-in', description: 'Controle a entrada dos participantes.', icon: ScanLine },
  { to: '/admin/financeiro', label: 'Financeiro', description: 'Receitas, despesas, custos e lucros.', icon: DollarSign },
  { to: '/admin/eobrain', label: 'eoBraia IA', description: 'Análises inteligentes, estatísticas e relatórios dos eventos.', icon: Brain },
  { to: '/admin/auditoria', label: 'Histórico', description: 'Veja todas as ações realizadas no sistema.', icon: ShieldCheck },
];

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <picture>
            <source srcSet="/images/logo.webp" type="image/webp" />
            <img
              src="/images/logo.webp"
              alt="Lux House"
              width={36}
              height={36}
              className="w-9 h-9 rounded-full"
            />
          </picture>
          <div>
            <div className="text-sm font-semibold tracking-wide text-white">Lux House</div>
            <div className="text-[9px] tracking-widest text-white/25 uppercase flex items-center gap-1">
              <Sparkles size={8} className="text-magenta-400" /> LUX OPERATIONS
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-start gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-magenta-500/12 text-magenta-300 border border-magenta-500/25 shadow-[inset_3px_0_0_#ec3ca8]' 
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className="mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium block">{item.label}</span>
                    <span className={`text-[10px] leading-tight block mt-0.5 ${isActive ? 'text-purple-400/50' : 'text-white/20'}`}>{item.description}</span>
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/8">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950 text-white flex selection:bg-magenta-500/30">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-[272px] shrink-0 border-r border-white/8 bg-dark-900/80 backdrop-blur-xl sticky top-0 h-screen">
          {sidebar}
        </aside>
      )}

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[272px] bg-dark-900 z-50 shadow-2xl"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar with event selector */}
        <div className="sticky top-0 z-30 bg-dark-950/96 backdrop-blur-xl border-b border-white/8 px-3 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 shrink-0"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
          <EventSelector />
          <div className="hidden sm:block text-[10px] tracking-[0.18em] text-white/30 uppercase ml-auto">Lux Operations</div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
          <div className="mb-7 sm:mb-9">
            <p className="text-[10px] tracking-[0.22em] uppercase text-magenta-400/80 mb-2">Lux Operations</p>
            <h1 className="font-luxe text-3xl sm:text-4xl font-semibold tracking-tight text-white">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
