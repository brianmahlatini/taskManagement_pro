import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEventStore } from '../../store/eventStore';
import { useBoardStore } from '../../store/boardStore';
import { X, Plus } from 'lucide-react';

const schema = yup.object({
    title: yup.string().required('Event title is required').min(2, 'Title must be at least 2 characters'),
    description: yup.string().optional(),
    startTime: yup.date().required('Start time is required'),
    endTime: yup.date().required('End time is required').min(yup.ref('startTime'), 'End time must be after start time'),
    type: yup.string().oneOf(['meeting', 'deadline', 'review', 'other']).required(),
    boardId: yup.string().optional(),
    allDay: yup.boolean().optional(),
});

type CreateEventFormData = yup.InferType<typeof schema>;

interface CreateEventModalProps {
    onClose: () => void;
    defaultDate?: Date;
}

const eventTypes = [
    { value: 'meeting', label: 'Meeting', color: '#3B82F6' },
    { value: 'deadline', label: 'Deadline', color: '#EF4444' },
    { value: 'review', label: 'Review', color: '#8B5CF6' },
    { value: 'other', label: 'Other', color: '#10B981' },
];

export function CreateEventModal({ onClose, defaultDate }: CreateEventModalProps) {
    const { createEvent } = useEventStore();
    const { boards } = useBoardStore();
    const [isLoading, setIsLoading] = useState(false);

    const defaultStartTime = defaultDate || new Date();
    const defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000); // 1 hour later

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<CreateEventFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            type: 'meeting',
            allDay: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
    });

    const selectedType = watch('type');
    const allDay = watch('allDay');

    const onSubmit = async (data: CreateEventFormData) => {
        try {
            setIsLoading(true);
            const selectedEventType = eventTypes.find(t => t.value === data.type);
            await createEvent({
                ...data,
                color: selectedEventType?.color || '#3B82F6',
            });
            onClose();
        } catch (error) {
            console.error('Failed to create event:', error);
            alert('Failed to create event. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <h2 className="text-lg font-semibold text-gray-900">Create Event</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Event Title *
                        </label>
                        <input
                            {...register('title')}
                            type="text"
                            id="title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter event title"
                            autoFocus
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            id="description"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter event description (optional)"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                Event Type *
                            </label>
                            <select
                                {...register('type')}
                                id="type"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            >
                                {eventTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="boardId" className="block text-sm font-medium text-gray-700 mb-2">
                                Related Board (Optional)
                            </label>
                            <select
                                {...register('boardId')}
                                id="boardId"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            >
                                <option value="">No board</option>
                                {boards.map((board) => (
                                    <option key={board._id} value={board._id}>
                                        {board.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            {...register('allDay')}
                            type="checkbox"
                            id="allDay"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
                            All day event
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                                Start {allDay ? 'Date' : 'Date & Time'} *
                            </label>
                            <input
                                {...register('startTime')}
                                type={allDay ? 'date' : 'datetime-local'}
                                id="startTime"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                            {errors.startTime && (
                                <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                                End {allDay ? 'Date' : 'Date & Time'} *
                            </label>
                            <input
                                {...register('endTime')}
                                type={allDay ? 'date' : 'datetime-local'}
                                id="endTime"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                            {errors.endTime && (
                                <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    <span>Create Event</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
