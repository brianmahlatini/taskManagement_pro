import React, { useState, useEffect } from 'react';
import { TopBar } from '../layout/TopBar';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useEventStore } from '../../store/eventStore';
import { CreateEventModal } from './CreateEventModal';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CalendarPage() {
  const { events, fetchEvents } = useEventStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
  };

  const isToday = (day: number) => {
    return today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear;
  };

  return (
    <div className="flex-1 overflow-auto">
      <TopBar
        title="Calendar"
        subtitle="Manage your schedule and deadlines"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        }
      />

      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {months[currentMonth]} {currentYear}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['month', 'week', 'day'] as const).map((viewType) => (
                  <button
                    key={viewType}
                    onClick={() => setView(viewType)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${view === viewType
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {viewType}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-100 rounded-lg ${day ? 'hover:bg-gray-50 cursor-pointer' : ''
                    } ${isToday(day || 0) ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${isToday(day) ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                        {day}
                      </div>

                      {/* Display events for this specific day */}
                      {(() => {
                        const dayEvents = events.filter((event) => {
                          const eventDate = new Date(event.startTime);
                          return eventDate.getDate() === day &&
                            eventDate.getMonth() === currentMonth &&
                            eventDate.getFullYear() === currentYear;
                        });
                        
                        return dayEvents.length > 0 && (
                          <div className="space-y-1">
                            {dayEvents.map((event) => (
                              <div
                                key={event._id}
                                className={`text-xs p-1 rounded text-white truncate ${
                                  event.type === 'deadline' ? 'bg-red-500' :
                                  event.type === 'meeting' ? 'bg-blue-500' :
                                  'bg-green-500'
                                }`}
                              >
                                {event.title}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-4 h-4 rounded-full bg-green-500" style={{ backgroundColor: '#10B981' }} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{event.startTime ? (typeof event.startTime === 'string' ? event.startTime : event.startTime.toLocaleTimeString()) : 'N/A'}</span>
                    </div>
                    {event.attendees?.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'review' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          defaultDate={selectedDate}
        />
      )}
    </div>
  );
}