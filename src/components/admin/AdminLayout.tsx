import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ScanLine, DollarSign,
  Sparkles, LogOut, Menu, X, ShieldCheck, Activity,
  CalendarDays, UserCheck, Brain,
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
  { to: '/admin/eventos', label: 'Eventos', description: 'Gerencie todos os seus eventos.', icon: CalendarDays },
  { to: '/admin/participantes', label: 'Participantes', description: 'Veja quem entrou e quem ainda falta entrar.', icon: UserCheck },
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
      <div className="p-5 border-b border-white/5">
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
            <div className="text-sm font-semibold text-gradient-primary">Lux House</div>
            <div className="text-[9px] tracking-widest text-white/25 uppercase flex items-center gap-1">
              <Sparkles size={8} className="text-purple-400" /> ERP
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
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

      <div className="p-3 border-t border-white/5">
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
    <div className="min-h-screen bg-dark-950 text-white flex">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-64 shrink-0 border-r border-white/5 bg-dark-900/60 backdrop-blur-xl sticky top-0 h-screen">
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
              className="fixed left-0 top-0 bottom-0 w-64 bg-dark-900 z-50"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar with event selector */}
        <div className="sticky top-0 z-30 bg-dark-950/95 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 shrink-0"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
          <EventSelector />
          <div className="hidden sm:block text-[9px] tracking-widest text-white/20 uppercase ml-auto">Lux House ERP</div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="font-playfair text-2xl sm:text-3xl text-white">{title}</h1>
            <div className="h-0.5 w-12 bg-gradient-to-r from-purple-500 to-pink-500 mt-2 rounded-full" />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
