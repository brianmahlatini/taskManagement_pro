import { Request, Response } from 'express';
import ArchivedItem from '../models/ArchivedItem';

// Get all archived items for the current user
export const getArchivedItems = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    const archivedItems = await ArchivedItem.find({
      $or: [
        { archivedBy: userId },
        { originalId: { $in: await getUserRelatedItems(userId) } }
      ]
    })
    .populate('archivedBy', 'name email avatarUrl')
    .sort({ archivedAt: -1 });

    res.json(archivedItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching archived items', error });
  }
};

// Restore an archived item
export const restoreItem = async (req: any, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    const archivedItem = await ArchivedItem.findOneAndDelete({
      _id: itemId,
      archivedBy: userId
    });

    if (!archivedItem) {
      return res.status(404).json({ message: 'Archived item not found or access denied' });
    }

    // In a real app, this would restore the actual item to its original collection
    // For now, we just delete from archive

    res.json({ message: 'Item restored successfully', item: archivedItem });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring item', error });
  }
};

// Permanently delete an archived item
export const deleteArchivedItem = async (req: any, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    const archivedItem = await ArchivedItem.findOneAndDelete({
      _id: itemId,
      archivedBy: userId
    });

    if (!archivedItem) {
      return res.status(404).json({ message: 'Archived item not found or access denied' });
    }

    res.json({ message: 'Item permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting archived item', error });
  }
};

// Helper function to get user-related items (would be implemented based on actual data structure)
async function getUserRelatedItems(userId: string): Promise<string[]> {
  // In a real implementation, this would query boards, cards, documents, etc.
  // that belong to the user and return their IDs
  return []; // Placeholder
}