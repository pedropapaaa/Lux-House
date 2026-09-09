import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';

// Lazy load all pages for optimal code splitting
const Home          = lazy(() => import('../pages/Home'));
const Payment       = lazy(() => import('../pages/Payment'));
const TicketPage    = lazy(() => import('../pages/TicketPage'));
const MyTickets     = lazy(() => import('../pages/MyTickets'));
const AdminLogin    = lazy(() => import('../pages/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
// Ultra-light check-in page - minimal dependencies
const CheckinLite   = lazy(() => import('../pages/CheckinLite'));
// ERP modules
const FinanceiroPage = lazy(() => import('../pages/admin/FinanceiroPage'));
const AuditoriaPage = lazy(() => import('../pages/admin/AuditoriaPage'));
const LivePanel     = lazy(() => import('../pages/admin/LivePanel'));
const EventsPage     = lazy(() => import('../pages/admin/EventsPage'));
const ParticipantsPage = lazy(() => import('../pages/admin/ParticipantsPage'));
const EobrainIAPage  = lazy(() => import('../pages/admin/EobrainIAPage'));

// Simple loader without framer-motion for faster initial render
function PageLoader() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <Spinner size={48} />
    </div>
  );
}

// Simple wrapper without animations for better mobile performance
function wrap(element: React.ReactElement) {
  return (
    <Suspense fallback={<PageLoader />}>
      {element}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: '/',                   element: wrap(<Home />) },
  { path: '/pagamento/:orderId', element: wrap(<Payment />) },
  { path: '/ingresso/:code',     element: wrap(<TicketPage />) },
  { path: '/meus-ingressos',     element: wrap(<MyTickets />) },
  { path: '/admin',              element: wrap(<AdminLogin />) },
  { path: '/admin/dashboard',    element: wrap(<AdminDashboard />) },
  { path: '/admin/eventos',      element: wrap(<EventsPage />) },
  { path: '/admin/participantes', element: wrap(<ParticipantsPage />) },
  { path: '/admin/checkin',      element: wrap(<CheckinLite />) },
  { path: '/admin/live',         element: wrap(<LivePanel />) },
  { path: '/admin/financeiro',   element: wrap(<FinanceiroPage />) },
  { path: '/admin/eobrain',      element: wrap(<EobrainIAPage />) },
  { path: '/admin/auditoria',    element: wrap(<AuditoriaPage />) },
]);
