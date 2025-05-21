import { saveFile, loadFile, deleteFile, loadAllFiles, clearIDB } from './storage.js';

export class VirtualFS {
    constructor() {
        this.tree = {};
    }

    async loadFromStorage() {
        const files = await loadAllFiles();
        for (const { path, content } of files) {
            this._insertPath(path, content);
        }
    }

    _insertPath(path, content) {
        const parts = path.split('/').filter(Boolean);
        let node = this.tree;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!node[part]) node[part] = { __folder__: true };
            node = node[part];
        }
        node[parts.at(-1)] = content;
    }


    async writeFile(path, content) {
        this._insertPath(path, content);
        await saveFile(path, content);
    }

    getFile(path) {
        const parts = path.split('/').filter(Boolean);
        let node = this.tree;
        for (let i = 0; i < parts.length - 1; i++) {
            node = node?.[parts[i]];
            if (!node) return null;
        }
        return node?.[parts.at(-1)] ?? null;
    }

    async readFile(path) {
        const inMemory = this.getFile(path);
        if (inMemory !== null) return inMemory;
        const fromStorage = await loadFile(path);
        if (fromStorage !== null) this._insertPath(path, fromStorage);
        return fromStorage;
    }

    async deleteFile(path) {
        const parts = path.split('/').filter(Boolean);
        let node = this.tree;
        for (let i = 0; i < parts.length - 1; i++) {
            node = node?.[parts[i]];
            if (!node) return false;
        }
        const key = parts.at(-1);
        if (node && node[key] !== undefined) {
            delete node[key];
            await this._deleteFromStorage(path);
            return true;
        }
        return false;
    }

    listDirectory(path = '') {
        const parts = path.split('/').filter(Boolean);
        let node = this.tree;
        for (let part of parts) {
            node = node?.[part];
            if (!node || typeof node === 'string') return [];
        }
        if (typeof node !== 'object') return [];
        return Object.keys(node).filter(key => key !== '__folder__');
    }

    async _deleteFromStorage(path) {
        await deleteFile(path);
    }

    isDirectory(path) {
        const parts = path.split('/').filter(Boolean);
        let node = this.tree;
        for (let part of parts) {
            node = node?.[part];
            if (!node) return false;
        }
        return typeof node === 'object' && node.__folder__ === true;
    }


    exists(path) {
        return this.getFile(path) !== null;
    }

    async mkdir(path) {
        const parts = path.split('/').filter(Boolean);
        let node = this.tree;
        for (let part of parts) {
            if (!node[part]) node[part] = { __folder__: true };
            node = node[part];
        }
        await saveFile(path, '__folder__');
    }

    clearfs() {
        clearIDB();
    }
}
