export interface IMonitor {
    startTimer(): void;
    /* Stop all activities */
    shutdown(): void;
}
