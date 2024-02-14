import { openDB, IDBPDatabase, IDBPObjectStore, IDBPTransaction } from 'idb';

export abstract class ListStorage<Type> {
    readonly name: string = 'scrape-storage';
    persistent: boolean = true;
    data:Map<string, Type> = new Map();
    db?: IDBPDatabase;

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
        this.db = await openDB(this.storageKey, 5, {
            upgrade(db, oldVersion: number, newVersion:number, transaction) {
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
        tx?: IDBPTransaction<unknown, ["data"], "readonly">,
    ): Promise<Type|undefined>{
        if(this.persistent && this.db){
            if(!tx){
                tx = this.db.transaction('data', 'readonly');
            }
            const store = tx.store;

            const existingValue = await store.index("_pk").get(identifier)
            return existingValue;
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
        tx?: IDBPTransaction<unknown, ["data"], "readwrite">,
    ): Promise<void>{
        if(this.persistent && this.db){
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
                }
            }else{
                // New elem
                await store.put({
                    "_pk": identifier,
                    "_createdAt": new Date(),
                    ...elem  
                })
            }
        }else{
            throw new Error('DB doesnt exist')
        }
    }

    async addElem(
        identifier: string,
        elem: Type,
        updateExisting: boolean = false
    ){
        if(this.persistent && this.db){
            try{
                await this._dbSetElem(identifier, elem, updateExisting)
            }catch(err){
                console.error(err)
            }
        }else{
            this.data.set(identifier, elem);
        }
    }

    async addElems(
        elems: [string, Type][],
        updateExisting: boolean = false
    ){
        if(this.persistent && this.db){
            const createPromises: Promise<void>[] = [];

            const tx = this.db.transaction('data', 'readwrite');
            const processedIdentifiers: string[] = []
            elems.forEach(([identifier, elem])=>{
                // Cannot send twice the same identifier in a single transaction. Would fail the whole transaction
                if(processedIdentifiers.indexOf(identifier)===-1){
                    processedIdentifiers.push(identifier)
                    createPromises.push(
                        this._dbSetElem(identifier, elem, updateExisting, tx)
                    )
                }
            });
            if(createPromises.length > 0){
                createPromises.push(tx.done)
                await Promise.all(createPromises)
            }
        }else{
            elems.forEach(([identifier, elem])=>{
                this.addElem(identifier, elem)
            })
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
                    data.set(_id, itemData)
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

