import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { EventProvider } from './context/EventContext';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EventProvider>
        <RouterProvider router={router} />
      </EventProvider>
    </QueryClientProvider>
  );
}
