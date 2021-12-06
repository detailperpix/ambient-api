import random from 'random';
export class Semaphore {
    private held = 0;
    private readonly fair: boolean;
    private readonly permits: number;
    private readonly queue: { permits: number; approve: () => void }[] = [];

    constructor(permits = 1, fair = false) {
        this.permits = permits;
        this.fair = fair;
    }

    async acquire(permits = 1): Promise<void> {
        return new Promise((resolve) => {
            const approve = (): void => resolve();
            const request = { permits, approve };

            this.queue.push(request);
            this.schedule();
        });
    }

    availablePermits(): number {
        return this.permits - this.held;
    }

    drainPermits(): number {
        let permits = 0;
        while (this.held !== this.permits) {
            this.held++;
            permits++;
        }
        return permits;
    }

    getQueueLength(): number {
        return this.queue.length;
    }

    hasQueuedThreads(): boolean {
        return !!this.queue.length;
    }

    isFair(): boolean {
        return this.fair;
    }

    release(permits = 1): void {
        this.held -= permits;
        if (this.held < 0) this.held = 0;
        this.schedule();
    }

    async tryAcquire(permits = 1, timeout?: number): Promise<boolean> {
        return new Promise((resolve) => {
            const approve = (): void => {
                resolve(true);
            };
            const request = { permits, approve };

            this.queue.push(request);
            if (timeout) {
                setTimeout(() => {
                    this.queue.splice(this.queue.indexOf(request), 1);
                    resolve(false);
                }, timeout);
            }

            this.schedule();
        });
    }

    private schedule(): void {
        const available = this.permits - this.held;
        if (available > 0) {
            const requests = this.queue.filter(({ permits }) => permits <= available);
            // missing random library import
            const request = this.fair ? requests.shift() : requests[random.integer(0, requests.length)];
            if (request) {
                this.queue.splice(this.queue.indexOf(request), 1);
                this.held += request.permits;
                request.approve();
                this.schedule();
            }
        }
    }
}