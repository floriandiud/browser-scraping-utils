import { IDBPDatabase, IDBPTransaction, DBSchema } from 'idb';
interface ElemDB {
    _pk: string;
    _createdAt: Date;
    _groupId?: string;
    [key: string]: any;
}
export interface ElemDBSchema extends DBSchema {
    data: {
        key: string;
        value: ElemDB;
        indexes: {
            _pk: string;
            _createdAt: Date;
            _groupId: string;
        };
    };
}
export declare abstract class ListStorage<Type> {
    readonly name: string;
    persistent: boolean;
    data: Map<string, Type>;
    db?: IDBPDatabase<ElemDBSchema>;
    constructor(options?: {
        name?: string;
        persistent?: boolean;
    });
    get storageKey(): string;
    initDB(): Promise<void>;
    _dbGetElem(identifier: string, tx?: IDBPTransaction<ElemDBSchema, ["data"], "readonly">): Promise<Type | undefined>;
    getElem(identifier: string): Promise<Type | undefined>;
    _dbSetElem(identifier: string, elem: Type, updateExisting?: boolean, groupId?: string, tx?: IDBPTransaction<ElemDBSchema, ["data"], "readwrite">): Promise<boolean>;
    addElem(identifier: string, elem: Type, updateExisting?: boolean, groupId?: string): Promise<boolean>;
    addElems(elems: [string, Type][], updateExisting?: boolean, groupId?: string): Promise<number>;
    deleteFromGroupId(groupId: string): Promise<number>;
    clear(): Promise<void>;
    getCount(): Promise<number>;
    getAll(): Promise<Map<string, Type>>;
    abstract itemToRow(item: Type): string[];
    abstract get headers(): string[];
    toCsvData(): Promise<string[][]>;
}
export {};
