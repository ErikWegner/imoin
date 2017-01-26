export interface IEnvironment {
    initAlarmAndCallback(delay: number, callback: () => void): void
}