import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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

const STORAGE_KEY = 'lux-erp-selected-event';
const DEFAULT_EVENT_ID = '00000000-0000-0000-0000-000000000001';

export function EventProvider({ children }: { children: ReactNode }) {
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_EVENT_ID;
  });

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (events.length > 0 && !events.find((e) => e.id === selectedEventId)) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  // Auto-transition: if any event has a scheduled transition time that has passed,
  // update its status in the background. Runs on load and every 30 seconds.
  useEffect(() => {
    if (!events.length) return;
    const now = Date.now();
    const due = events.filter(
      (e) => e.auto_transition_at && e.auto_transition_to && new Date(e.auto_transition_at).getTime() <= now && e.status !== e.auto_transition_to,
    );
    if (due.length === 0) return;
    (async () => {
      for (const e of due) {
        const target = e.auto_transition_to as EventStatus;
        await supabase.from('events').update({ status: target, auto_transition_at: null, auto_transition_to: null }).eq('id', e.id);
      }
    })();
  }, [events]);

  const selectEvent = useCallback((id: string) => {
    setSelectedEventId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  return (
    <EventContext.Provider value={{ selectedEventId, selectedEvent, events, isLoadingEvents: isLoading, selectEvent }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEventContext must be used within EventProvider');
  return ctx;
}
