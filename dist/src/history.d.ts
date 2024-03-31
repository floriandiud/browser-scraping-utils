interface HistoryLog {
    createdAt: Date;
    label: string;
    groupId: string;
    numberItems: number;
}
export declare class HistoryTracker {
    readonly onDelete: (groupId: string) => void;
    readonly maxLogs: number;
    readonly container: HTMLElement;
    readonly logs: HistoryLog[];
    listRef: HTMLUListElement | null;
    constructor({ onDelete, divContainer, maxLogs }: {
        onDelete: (groupId: string) => void;
        divContainer: HTMLDivElement;
        maxLogs?: number;
    });
    createHistoryPanel(): void;
    renderLogs(): void;
    addHistoryLog({ label, groupId, numberItems }: {
        label: string;
        groupId: string;
        numberItems: number;
    }): void;
}
export {};
