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
            this.db = yield openDB(this.storageKey, 3, {
                upgrade(db) {
                    db.createObjectStore('data', {
                        keyPath: '_id'
                    });
                }
            });
        });
    }
    _dbAddElem(identifier, elem) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                yield this.db.put('data', Object.assign({ "_id": identifier }, elem));
            }
            else {
                throw new Error('DB doesnt exist');
            }
        });
    }
    addElem(identifier, elem) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                try {
                    yield this._dbAddElem(identifier, elem);
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
    addElems(elems) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistent && this.db) {
                const createPromises = [];
                elems.forEach(([identifier, elem]) => {
                    createPromises.push(this._dbAddElem(identifier, elem));
                });
                yield Promise.all(createPromises);
            }
            else {
                elems.forEach(([identifier, elem]) => {
                    this.addElem(identifier, elem);
                });
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
