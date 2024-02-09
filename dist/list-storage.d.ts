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
    _dbGetElem(identifier: string, tx?: IDBPTransaction<unknown, ["data"], "readonly">): Promise<Type | undefined>;
    getElem(identifier: string): Promise<Type | undefined>;
    _dbSetElem(identifier: string, elem: Type, updateExisting?: boolean, tx?: IDBPTransaction<unknown, ["data"], "readwrite">): Promise<void>;
    addElem(identifier: string, elem: Type, updateExisting?: boolean): Promise<void>;
    addElems(elems: [string, Type][], updateExisting?: boolean): Promise<void>;
    clear(): Promise<void>;
    getCount(): Promise<number>;
    getAll(): Promise<Map<string, Type>>;
    abstract itemToRow(item: Type): string[];
    abstract get headers(): string[];
    toCsvData(): Promise<string[][]>;
}
