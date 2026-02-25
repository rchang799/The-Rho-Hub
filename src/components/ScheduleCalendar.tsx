import { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { PlanEvent } from '../types';
import CalendarToolbar from './CalendarToolbar';
import EventEditorModal from './EventEditorModal';

const localizer = momentLocalizer(moment);

interface ScheduleCalendarProps {
  events: PlanEvent[];
  onEventsChange: (events: PlanEvent[]) => void;
}

export default function ScheduleCalendar({ events, onEventsChange }: ScheduleCalendarProps) {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<PlanEvent> | null>(null);

  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);
  const onView = useCallback((newView: View) => setView(newView), [setView]);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent({ start, end });
    setIsModalOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: PlanEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleEventDrop = useCallback(({ event, start, end }: { event: any; start: Date; end: Date }) => {
    const updatedEvents = events.map(e => 
      e.id === event.resource.id ? { ...e, start, end } : e
    );
    onEventsChange(updatedEvents);
  }, [events, onEventsChange]);

  const handleEventResize = useCallback(({ event, start, end }: { event: any; start: Date; end: Date }) => {
    const updatedEvents = events.map(e => 
      e.id === event.resource.id ? { ...e, start, end } : e
    );
    onEventsChange(updatedEvents);
  }, [events, onEventsChange]);

  const handleSaveEvent = (eventData: Omit<PlanEvent, 'id' | 'source' | 'priority' | 'completed' | 'weight'>) => {
    if (selectedEvent?.id) {
      // Update existing event
      const updatedEvents = events.map(e => 
        e.id === selectedEvent.id ? { ...e, ...eventData } : e
      );
      onEventsChange(updatedEvents);
    } else {
      // Create new event
      const newEvent: PlanEvent = {
        ...eventData,
        id: `user-${Date.now()}`,
        source: 'user',
        priority: 'Medium',
        completed: false,
        weight: 0,
      };
      onEventsChange([...events, newEvent]);
    }
  };

  const calendarEvents = events.map(event => ({
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: false,
    resource: event,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-[70vh]">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        date={date}
        view={view}
        onNavigate={onNavigate}
        onView={onView}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        selectable
        resizable
        components={{
          toolbar: CalendarToolbar,
        }}
      />
      <EventEditorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        eventInfo={selectedEvent}
      />
    </div>
  );
}
