interface HistoryLog {
    index: number;
    createdAt: Date;
    label: string;
    groupId: string;
    numberItems: number;
    cancellable: boolean;
}
export declare class HistoryTracker {
    readonly onDelete: (groupId: string) => Promise<void>;
    readonly maxLogs: number;
    readonly container: HTMLElement;
    logs: HistoryLog[];
    panelRef: HTMLDivElement | null;
    counter: number;
    constructor({ onDelete, divContainer, maxLogs }: {
        onDelete: (groupId: string) => Promise<void>;
        divContainer: HTMLDivElement;
        maxLogs?: number;
    });
    renderPanel(): HTMLDivElement;
    renderLogs(): void;
    addHistoryLog({ label, groupId, numberItems, cancellable }: {
        label: string;
        groupId: string;
        numberItems: number;
        cancellable: boolean;
    }): void;
    cleanLogs(): void;
}
export {};
