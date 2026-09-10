import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Event, EventStatus } from '../types';

interface EventContextValue {
  selectedEventId: string;
  selectedEvent: Event | null;
  events: Event[];
  isLoadingEvents: boolean;
  selectEvent: (id: string) => void;
}

const EventContext = createContext<EventContextValue | null>(null);
const DEFAULT_EVENT_ID = '00000000-0000-0000-0000-000000000001';

export function EventProvider({ children }: { children: ReactNode }) {
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false }).limit(1);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60,
  });

  const event = events[0] ?? null;

  useEffect(() => {
    if (!event?.auto_transition_at || !event.auto_transition_to || event.status === event.auto_transition_to) return;
    if (new Date(event.auto_transition_at).getTime() > Date.now()) return;
    void supabase.from('events').update({ status: event.auto_transition_to as EventStatus, auto_transition_at: null, auto_transition_to: null }).eq('id', event.id);
  }, [event]);

  return (
    <EventContext.Provider
      value={{
        selectedEventId: event?.id ?? DEFAULT_EVENT_ID,
        selectedEvent: event,
        events,
        isLoadingEvents: isLoading,
        selectEvent: () => undefined,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEventContext must be used within EventProvider');
  return ctx;
}
