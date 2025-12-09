import { Request, Response } from 'express';
import Event from '../models/Event';

// Get all events for a user
export const getEvents = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        // Get events where user is creator or attendee
        const events = await Event.find({
            $or: [
                { createdBy: userId },
                { attendees: userId }
            ]
        })
            .populate('createdBy', 'name email avatarUrl')
            .populate('attendees', 'name email avatarUrl')
            .populate('boardId', 'title')
            .sort({ startTime: 1 });

        res.json(events);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get event by ID
export const getEventById = async (req: Request, res: Response) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name email avatarUrl')
            .populate('attendees', 'name email avatarUrl')
            .populate('boardId', 'title');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Create event
export const createEvent = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { title, description, startTime, endTime, type, boardId, attendees, color, allDay } = req.body;

        const event = new Event({
            title,
            description,
            startTime,
            endTime,
            type,
            boardId,
            createdBy: userId,
            attendees: attendees || [],
            color: color || '#3B82F6',
            allDay: allDay || false,
        });

        await event.save();

        const populatedEvent = await Event.findById(event._id)
            .populate('createdBy', 'name email avatarUrl')
            .populate('attendees', 'name email avatarUrl')
            .populate('boardId', 'title');

        res.status(201).json(populatedEvent);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update event
export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { title, description, startTime, endTime, type, boardId, attendees, color, allDay } = req.body;

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { title, description, startTime, endTime, type, boardId, attendees, color, allDay },
            { new: true }
        )
            .populate('createdBy', 'name email avatarUrl')
            .populate('attendees', 'name email avatarUrl')
            .populate('boardId', 'title');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
