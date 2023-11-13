import { IEnvironment } from '../IEnvironment';
import { ImoinMonitorInstance } from '../Settings';

export interface IMonitor {
    init(environment: IEnvironment, instance: ImoinMonitorInstance, index: number): void;
    startTimer(): void;
    /* Stop all activities */
    shutdown(): void;
}
