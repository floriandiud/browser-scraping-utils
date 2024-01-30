import { openDB, IDBPDatabase, IDBPObjectStore } from 'idb';

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
        this.db = await openDB(this.storageKey, 4, {
            upgrade(db, oldVersion: number, newVersion:number, transaction) {
                let dataStore: IDBPObjectStore<any, any, any, any>;
                
                if (!db.objectStoreNames.contains("data")) {
                    dataStore = db.createObjectStore('data', {
                        keyPath: '_id'
                    });
                } else {
                    dataStore = transaction.objectStore('data');
                }
                if (dataStore && !dataStore.indexNames.contains("_createdAt")) {
                    // @ts-ignore
                    dataStore.createIndex("_createdAt", "_createdAt");
                }
            }
        });
    }

    async _dbAddElem(identifier: string, elem: Type): Promise<void>{
        if(this.persistent && this.db){
            await this.db.put('data', {
                "_id": identifier,
                "_createdAt": new Date(),
                ...elem  
            })
        }else{
            throw new Error('DB doesnt exist')
        }
    }

    async addElem(identifier: string, elem: Type){
        if(this.persistent && this.db){
            try{
                await this._dbAddElem(identifier, elem)
            }catch(err){
                console.error(err)
            }
        }else{
            this.data.set(identifier, elem);
        }
    }

    async addElems(elems: [string, Type][]){
        if(this.persistent && this.db){
            const createPromises: Promise<void>[] = [];
            elems.forEach(([identifier, elem])=>{
                createPromises.push(
                    this._dbAddElem(identifier, elem)
                )
            })
            await Promise.all(createPromises)
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
            const dbData = await this.db.getAllFromIndex('data', "_createdAt")
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

