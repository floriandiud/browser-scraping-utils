import { IDBPDatabase, IDBPTransaction } from 'idb';
export declare abstract class ListStorage<Type> {
    readonly name: string;
    persistent: boolean;
    data: Map<string, Type>;
    db?: IDBPDatabase;
    constructor(options?: {
        name?: string;
        persistent?: boolean;
    });
    get storageKey(): string;
    initDB(): Promise<void>;
    _dbAddElem(identifier: string, elem: Type, tx?: IDBPTransaction<unknown, ["data"], "readwrite">): Promise<void>;
    addElem(identifier: string, elem: Type): Promise<void>;
    addElems(elems: [string, Type][]): Promise<void>;
    clear(): Promise<void>;
    getCount(): Promise<number>;
    getAll(): Promise<Map<string, Type>>;
    abstract itemToRow(item: Type): string[];
    abstract get headers(): string[];
    toCsvData(): Promise<string[][]>;
}
