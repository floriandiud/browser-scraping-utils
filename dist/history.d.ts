export declare enum LogCategory {
    ADD = "add",
    LOG = "log"
}
interface HistoryLogAdds {
    index: number;
    createdAt: Date;
    label: string;
    groupId: string;
    numberItems: number;
    cancellable?: boolean;
    category: LogCategory.ADD;
}
interface HistoryLogInfo {
    index: number;
    createdAt: Date;
    label: string;
    category: LogCategory.LOG;
}
export declare class HistoryTracker {
    readonly onDelete: (groupId: string) => Promise<void>;
    readonly maxLogs: number;
    readonly container: HTMLElement;
    logs: Array<HistoryLogAdds | HistoryLogInfo>;
    panelRef: HTMLDivElement | null;
    counter: number;
    constructor({ onDelete, divContainer, maxLogs }: {
        onDelete: (groupId: string) => Promise<void>;
        divContainer: HTMLDivElement;
        maxLogs?: number;
    });
    renderPanel(): HTMLDivElement;
    renderLogs(): void;
    addHistoryLog(data: {
        label: string;
        groupId: string;
        numberItems: number;
        cancellable: boolean;
        category: LogCategory.ADD;
    } | {
        label: string;
        category: LogCategory.LOG;
    }): void;
    cleanLogs(): void;
}
export {};
