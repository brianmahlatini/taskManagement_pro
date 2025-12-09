import { v4 as uuidv4 } from 'uuid';

interface QueuedAction {
    id: string;
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    endpoint: string;
    data: any;
    timestamp: number;
    retries: number;
    maxRetries: number;
}

class OfflineQueue {
    private static readonly QUEUE_KEY = 'offlineQueue';
    private static readonly MAX_RETRIES = 3;
    private static readonly RETRY_DELAY = 5000; // 5 seconds

    static async addToQueue(type: 'CREATE' | 'UPDATE' | 'DELETE', endpoint: string, data: any): Promise<QueuedAction> {
        const action: QueuedAction = {
            id: uuidv4(),
            type,
            endpoint,
            data,
            timestamp: Date.now(),
            retries: 0,
            maxRetries: this.MAX_RETRIES,
        };

        const queue = this.getQueue();
        queue.push(action);
        this.saveQueue(queue);

        // Start processing if not already running
        this.processQueue();

        return action;
    }

    static async processQueue(): Promise<void> {
        if (!navigator.onLine) {
            console.log('Offline: Queue will be processed when back online');
            return;
        }

        const queue = this.getQueue();
        if (queue.length === 0) {
            console.log('Offline queue is empty');
            return;
        }

        console.log(`Processing offline queue with ${queue.length} items...`);

        // Process items in order
        for (const action of queue) {
            try {
                await this.executeAction(action);
                // Remove successful action from queue
                const updatedQueue = queue.filter(item => item.id !== action.id);
                this.saveQueue(updatedQueue);
                console.log(`Successfully processed action ${action.type} ${action.endpoint}`);
            } catch (error) {
                console.error(`Failed to process action ${action.type} ${action.endpoint}:`, error);

                // Increment retries
                action.retries++;

                if (action.retries >= action.maxRetries) {
                    console.error(`Max retries reached for action ${action.id}, removing from queue`);
                    // Remove failed action from queue
                    const updatedQueue = queue.filter(item => item.id !== action.id);
                    this.saveQueue(updatedQueue);
                } else {
                    // Save updated queue with incremented retries
                    this.saveQueue(queue);
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
                }
            }
        }
    }

    private static async executeAction(action: QueuedAction): Promise<void> {
        const { type, endpoint, data } = action;
        const api = (await import('../api/axios')).default;

        try {
            switch (type) {
                case 'CREATE':
                    await api.post(endpoint, data);
                    break;
                case 'UPDATE':
                    await api.put(endpoint, data);
                    break;
                case 'DELETE':
                    await api.delete(endpoint);
                    break;
                default:
                    throw new Error(`Unknown action type: ${type}`);
            }
        } catch (error) {
            console.error(`Error executing ${type} action for ${endpoint}:`, error);
            throw error;
        }
    }

    static getQueue(): QueuedAction[] {
        try {
            const queueJson = localStorage.getItem(this.QUEUE_KEY);
            return queueJson ? JSON.parse(queueJson) : [];
        } catch (error) {
            console.error('Error reading offline queue:', error);
            return [];
        }
    }

    private static saveQueue(queue: QueuedAction[]): void {
        try {
            localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
        } catch (error) {
            console.error('Error saving offline queue:', error);
        }
    }

    static async setupOnlineListener(): Promise<void> {
        window.addEventListener('online', () => {
            console.log('Back online, processing offline queue...');
            this.processQueue();
        });

        // Check if we're online now
        if (navigator.onLine) {
            console.log('Online, processing any queued actions...');
            this.processQueue();
        }
    }

    static async clearQueue(): Promise<void> {
        this.saveQueue([]);
        console.log('Offline queue cleared');
    }

    static getQueueSize(): number {
        return this.getQueue().length;
    }
}

export default OfflineQueue;