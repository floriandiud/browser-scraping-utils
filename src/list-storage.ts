import { openDB, IDBPDatabase, IDBPObjectStore, IDBPTransaction, DBSchema } from 'idb';

interface ElemDB {
    _pk: string
    _createdAt: Date,
    _groupId?: string,
    [key: string]: any
}

export interface ElemDBSchema extends DBSchema {
    data: {
        key: string,
        value: ElemDB,
        indexes: {
            _pk: string,
            _createdAt: Date,
            _groupId: string
        }
    }
}

export abstract class ListStorage<Type> {
    readonly name: string = 'scrape-storage';
    persistent: boolean = true;
    data:Map<string, Type> = new Map();
    db?: IDBPDatabase<ElemDBSchema>;

    constructor(options?: {
        name?: string,
        persistent?: boolean
    }){
        if(options?.name) this.name = options.name;
        if(options?.persistent) this.persistent = options.persistent;

        this.initDB().then(()=>{
        }).catch(()=>{
            this.persistent = false;
        })
    }

    get storageKey(){
        return `storage-${this.name}`
    }

    async initDB(){
        this.db = await openDB(this.storageKey, 6, {
            upgrade(db: IDBPDatabase<ElemDBSchema>, oldVersion: number, newVersion:number, transaction) {
                let dataStore: IDBPObjectStore<any, any, any, any>;

                if(oldVersion<5){
                    try{
                        db.deleteObjectStore('data');
                    }catch(err){}
                }
                
                if (!db.objectStoreNames.contains("data")) {
                    dataStore = db.createObjectStore('data', {
                        keyPath: '_id',
                        autoIncrement: true
                    });
                } else {
                    dataStore = transaction.objectStore('data');
                }
                if (dataStore && !dataStore.indexNames.contains("_createdAt")) {
                    // @ts-ignore
                    dataStore.createIndex("_createdAt", "_createdAt");
                }
                if (dataStore && !dataStore.indexNames.contains("_groupId")) {
                    // @ts-ignore
                    dataStore.createIndex("_groupId", "_groupId");
                }
                if (dataStore && !dataStore.indexNames.contains("_pk")) {
                    // @ts-ignore
                    dataStore.createIndex("_pk", "_pk", {
                        unique: true
                    });
                }
            }
        });
    }

    async _dbGetElem(
        identifier: string,
        tx?: IDBPTransaction<ElemDBSchema, ["data"], "readonly">,
    ): Promise<Type|undefined>{
        if(this.persistent && this.db){
            if(!tx){
                tx = this.db.transaction('data', 'readonly');
            }
            const store = tx.store;

            const existingValue = await store.index("_pk").get(identifier)
            return existingValue as Type;
        }else{
            throw new Error('DB doesnt exist')
        }
    }

    async getElem(
        identifier: string
    ): Promise<Type|undefined> {
        if(this.persistent && this.db){
            try{
                return await this._dbGetElem(identifier)
            }catch(err){
                console.error(err)
            }
        }else{
            this.data.get(identifier);
        }
    }

    async _dbSetElem(
        identifier: string,
        elem: Type,
        updateExisting: boolean = false,
        groupId?: string,
        tx?: IDBPTransaction<ElemDBSchema, ["data"], "readwrite">,
    ): Promise<boolean>{
        if(this.persistent && this.db){
            let saved = false;

            if(!tx){
                tx = this.db.transaction('data', 'readwrite');
            }
            const store = tx.store;

            const existingValue = await store.index("_pk").get(identifier)

            if(existingValue){
                if(updateExisting){
                    await store.put({
                        ...existingValue,
                        ...elem  
                    })
                    saved = true;
                }
            }else{
                // New elem
                const toStore: ElemDB = {
                    "_pk": identifier,
                    "_createdAt": new Date(),
                    ...elem  
                }
                if(groupId){
                    toStore['_groupId'] = groupId
                }
                await store.put(toStore);
                saved = true;
            }

            return saved;
        }else{
            throw new Error('DB doesnt exist')
        }
    }

    async addElem(
        identifier: string,
        elem: Type,
        updateExisting: boolean = false,
        groupId?: string
    ): Promise<boolean> {
        if(this.persistent && this.db){
            try{
                return await this._dbSetElem(
                    identifier,
                    elem,
                    updateExisting,
                    groupId
                )
            }catch(err){
                console.error(err)
            }
        }else{
            this.data.set(identifier, elem);
        }
        return true;
    }

    async addElems(
        elems: [string, Type][],
        updateExisting: boolean = false,
        groupId?: string
    ): Promise<number> {

        if(this.persistent && this.db){
            const createPromises: Promise<boolean|void>[] = [];

            const tx = this.db.transaction('data', 'readwrite');
            const processedIdentifiers: string[] = []
            elems.forEach(([identifier, elem])=>{
                // Cannot send twice the same identifier in a single transaction. Would fail the whole transaction
                if(processedIdentifiers.indexOf(identifier)===-1){
                    processedIdentifiers.push(identifier)
                    createPromises.push(
                        this._dbSetElem(
                            identifier,
                            elem,
                            updateExisting,
                            groupId,
                            tx
                        )
                    )
                }
            });
            if(createPromises.length > 0){
                createPromises.push(tx.done)
                const results = await Promise.all(createPromises);
                let counter = 0;
                results.forEach((result)=>{
                    if(typeof(result)==="boolean" && result){
                        counter += 1;
                    }
                })
                return counter
            }
            return 0
        }else{
            elems.forEach(([identifier, elem])=>{
                this.addElem(identifier, elem)
            })
            return elems.length;
        }
    }

    async deleteFromGroupId(
        groupId: string
    ): Promise<number> {
        if(this.persistent && this.db){
            let counter = 0;
            const txWrite = this.db.transaction('data', 'readwrite');
            let cursor = await txWrite.store.index('_groupId').openCursor(IDBKeyRange.only(groupId))
            while (cursor) {
                cursor.delete()
                cursor = await cursor.continue();
                counter += 1
            }
            return counter;
        }else{
            throw new Error('Not Implemented Error')
        }
    }

    async clear(): Promise<void> {
        if(this.persistent && this.db){
            await this.db.clear('data')
        }else{
            this.data.clear();
        }
    }

    async getCount(): Promise<number>{
        if(this.persistent && this.db){
            return await this.db.count('data')
        }else{
            return this.data.size;
        }
    }

    async getAll(): Promise<Map<string, Type>>{
        if(this.persistent && this.db){
            const data = new Map<string, Type>()
            const dbData = await this.db.getAll('data')
            if(dbData){
                dbData.forEach((storageItem)=>{
                    const {
                        _id,
                        ...itemData
                    } = storageItem;
                    data.set(_id, itemData as Type)
                })
            }
            return data;
        }else{
            return this.data;
        }
    }

    abstract itemToRow(item: Type): string[]

    abstract get headers(): string[]

    async toCsvData(): Promise<string[][]>{
        const rows: string[][] = [];
        rows.push(this.headers)

        const data = await this.getAll();
        data.forEach((item)=>{
            try{
                rows.push(this.itemToRow(item))
            }catch(err){
                console.error(err)
            }
        });
        return rows;
    }
}

