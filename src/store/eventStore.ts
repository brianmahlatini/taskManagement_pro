import { create } from 'zustand';
import api from '../api/axios';

interface Event {
    _id: string;
    title: string;
    description?: string;
    startTime: string | Date;
    endTime: string | Date;
    type: 'meeting' | 'deadline' | 'review' | 'other';
    boardId?: string;
    createdBy: any;
    attendees: any[];
    color: string;
    allDay: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface EventState {
    events: Event[];
    fetchEvents: () => Promise<void>;
    createEvent: (eventData: Partial<Event>) => Promise<void>;
    updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
    events: [],

    fetchEvents: async () => {
        try {
            const { data } = await api.get('/events');
            set({ events: data });
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    },

    createEvent: async (eventData) => {
        try {
            const { data } = await api.post('/events', eventData);
            set(state => ({ events: [...state.events, data] }));
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    updateEvent: async (eventId, updates) => {
        try {
            const { data } = await api.put(`/events/${eventId}`, updates);
            set(state => ({
                events: state.events.map(e => e._id === eventId ? data : e)
            }));
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    deleteEvent: async (eventId) => {
        try {
            await api.delete(`/events/${eventId}`);
            set(state => ({
                events: state.events.filter(e => e._id !== eventId)
            }));
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },
}));
