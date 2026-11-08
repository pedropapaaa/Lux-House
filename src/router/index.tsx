import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';

const RELOAD_FLAG = 'lux-chunk-reload';

// After a deploy, an open tab can request a page file that no longer exists; reload once to get the current version.
function lazyPage(factory: () => Promise<{ default: ComponentType }>) {
  return lazy(() =>
    factory()
      .then((module) => {
        sessionStorage.removeItem(RELOAD_FLAG);
        return module;
      })
      .catch((error) => {
        if (!sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, '1');
          window.location.reload();
          return new Promise<{ default: ComponentType }>(() => {});
        }
        throw error;
      })
  );
}

// Lazy load all pages for optimal code splitting
const Home          = lazyPage(() => import('../pages/Home'));
const Payment       = lazyPage(() => import('../pages/Payment'));
const TicketPage    = lazyPage(() => import('../pages/TicketPage'));
const MyTickets     = lazyPage(() => import('../pages/MyTickets'));
const AdminLogin    = lazyPage(() => import('../pages/AdminLogin'));
const AdminDashboard = lazyPage(() => import('../pages/AdminDashboard'));
// Ultra-light check-in page - minimal dependencies
const CheckinLite   = lazyPage(() => import('../pages/CheckinLite'));
// ERP modules
const FinanceiroPage = lazyPage(() => import('../pages/admin/FinanceiroPage'));
const AuditoriaPage = lazyPage(() => import('../pages/admin/AuditoriaPage'));
const LivePanel     = lazyPage(() => import('../pages/admin/LivePanel'));
const ParticipantsPage = lazyPage(() => import('../pages/admin/ParticipantsPage'));
const EventEditPage = lazyPage(() => import('../pages/admin/EventEditPage'));
const NewEventPage = lazyPage(() => import('../pages/admin/NewEventPage'));
const ArchivedEventsPage = lazyPage(() => import('../pages/admin/ArchivedEventsPage'));
const EobrainIAPage  = lazyPage(() => import('../pages/admin/EobrainIAPage'));

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
  { path: '/admin/participantes', element: wrap(<ParticipantsPage />) },
  { path: '/admin/evento',       element: wrap(<EventEditPage />) },
  { path: '/admin/checkin',      element: wrap(<CheckinLite />) },
  { path: '/admin/live',         element: wrap(<LivePanel />) },
  { path: '/admin/financeiro',   element: wrap(<FinanceiroPage />) },
  { path: '/admin/eobrain',      element: wrap(<EobrainIAPage />) },
  { path: '/admin/auditoria',    element: wrap(<AuditoriaPage />) },
  { path: '/admin/novo-evento',   element: wrap(<NewEventPage />) },
  { path: '/admin/arquivados',    element: wrap(<ArchivedEventsPage />) },
]);
