import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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
const STORAGE_KEY = 'lux_selected_event_id';

export function EventProvider({ children }: { children: ReactNode }) {
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
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

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? events.find((e) => !e.is_archived) ?? events[0] ?? null;

  useEffect(() => {
    if (selectedEvent && selectedEvent.id !== selectedEventId) {
      setSelectedEventId(selectedEvent.id);
    }
  }, [selectedEvent, selectedEventId]);

  useEffect(() => {
    if (selectedEventId) {
      localStorage.setItem(STORAGE_KEY, selectedEventId);
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (!selectedEvent?.auto_transition_at || !selectedEvent.auto_transition_to || selectedEvent.status === selectedEvent.auto_transition_to) return;
    if (new Date(selectedEvent.auto_transition_at).getTime() > Date.now()) return;
    void supabase.from('events').update({ status: selectedEvent.auto_transition_to as EventStatus, auto_transition_at: null, auto_transition_to: null }).eq('id', selectedEvent.id);
  }, [selectedEvent]);

  const selectEvent = (id: string) => setSelectedEventId(id);

  return (
    <EventContext.Provider
      value={{
        selectedEventId: selectedEvent?.id ?? DEFAULT_EVENT_ID,
        selectedEvent,
        events,
        isLoadingEvents: isLoading,
        selectEvent,
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
