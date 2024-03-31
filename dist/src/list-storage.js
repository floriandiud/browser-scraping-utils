var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { openDB } from 'idb';
export class ListStorage {
    constructor(options) {
        this.name = 'scrape-storage';
        this.persistent = true;
        this.data = new Map();
        if (options === null || options === void 0 ? void 0 : options.name)
            this.name = options.name;
        if (options === null || options === void 0 ? void 0 : options.persistent)
            this.persistent = options.persistent;
        this.initDB().then(() => {
        }).catch(() => {
            this.persistent = false;
        });
    }
    get storageKey() {
        return `storage-${this.name}`;
    }
    initDB() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db = yield openDB(this.storageKey, 6, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    let dataStore;
                    if (oldVersion < 5) {
                        try {
                            db.deleteObjectStore('data');
                        }
                        catch (err) { }
                    }
                    if (!db.objectStoreNames.contains("data")) {
                        dataStore = db.createObjectStore('data', {
                            keyPath: '_id',
                            autoIncrement: true
                        });
                    }
                    else {
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
        });
    }
    _dbGetElem(identifier, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                if (!tx) {
                    tx = this.db.transaction('data', 'readonly');
                }
                const store = tx.store;
                const existingValue = yield store.index("_pk").get(identifier);
                return existingValue;
            }
            else {
                throw new Error('DB doesnt exist');
            }
        });
    }
    getElem(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                try {
                    return yield this._dbGetElem(identifier);
                }
                catch (err) {
                    console.error(err);
                }
            }
            else {
                this.data.get(identifier);
            }
        });
    }
    _dbSetElem(identifier, elem, updateExisting = false, groupId, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                if (!tx) {
                    tx = this.db.transaction('data', 'readwrite');
                }
                const store = tx.store;
                const existingValue = yield store.index("_pk").get(identifier);
                if (existingValue) {
                    if (updateExisting) {
                        yield store.put(Object.assign(Object.assign({}, existingValue), elem));
                    }
                }
                else {
                    // New elem
                    const toStore = Object.assign({ "_pk": identifier, "_createdAt": new Date() }, elem);
                    if (groupId) {
                        toStore['_groupId'] = groupId;
                    }
                    yield store.put(toStore);
                }
            }
            else {
                throw new Error('DB doesnt exist');
            }
        });
    }
    addElem(identifier, elem, updateExisting = false, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                try {
                    yield this._dbSetElem(identifier, elem, updateExisting, groupId);
                }
                catch (err) {
                    console.error(err);
                }
            }
            else {
                this.data.set(identifier, elem);
            }
        });
    }
    addElems(elems, updateExisting = false, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                const createPromises = [];
                const tx = this.db.transaction('data', 'readwrite');
                const processedIdentifiers = [];
                elems.forEach(([identifier, elem]) => {
                    // Cannot send twice the same identifier in a single transaction. Would fail the whole transaction
                    if (processedIdentifiers.indexOf(identifier) === -1) {
                        processedIdentifiers.push(identifier);
                        createPromises.push(this._dbSetElem(identifier, elem, updateExisting, groupId, tx));
                    }
                });
                if (createPromises.length > 0) {
                    createPromises.push(tx.done);
                    yield Promise.all(createPromises);
                }
            }
            else {
                elems.forEach(([identifier, elem]) => {
                    this.addElem(identifier, elem);
                });
            }
        });
    }
    deleteFromGroupId(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                let counter = 0;
                const txWrite = this.db.transaction('data', 'readwrite');
                let cursor = yield txWrite.store.index('_groupId').openCursor(IDBKeyRange.only(groupId));
                while (cursor) {
                    cursor.delete();
                    cursor = yield cursor.continue();
                    counter += 1;
                }
                return counter;
            }
            else {
                throw new Error('Not Implemented Error');
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                yield this.db.clear('data');
            }
            else {
                this.data.clear();
            }
        });
    }
    getCount() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                return yield this.db.count('data');
            }
            else {
                return this.data.size;
            }
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                const data = new Map();
                const dbData = yield this.db.getAll('data');
                if (dbData) {
                    dbData.forEach((storageItem) => {
                        const { _id } = storageItem, itemData = __rest(storageItem, ["_id"]);
                        data.set(_id, itemData);
                    });
                }
                return data;
            }
            else {
                return this.data;
            }
        });
    }
    toCsvData() {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = [];
            rows.push(this.headers);
            const data = yield this.getAll();
            data.forEach((item) => {
                try {
                    rows.push(this.itemToRow(item));
                }
                catch (err) {
                    console.error(err);
                }
            });
            return rows;
        });
    }
}
