const DB_NAME = 'VirtualFS';
const STORE_NAME = 'files';

export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(STORE_NAME, { keyPath: 'path' });
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveFile = async (path, content) => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ path, content });
    return tx.complete;
};

export const loadFile = async (path) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(path);
        request.onsuccess = () => resolve(request.result ? request.result.content : null);
        request.onerror = () => reject(request.error);
    });
};

export const deleteFile = async (path) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(path);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const loadAllFiles = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const clearIDB = async () => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]);
    req.then((dbs) => {
      const deletions = dbs.map(dbInfo => {
        return new Promise((res, rej) => {
          const delReq = indexedDB.deleteDatabase(dbInfo.name);
          delReq.onsuccess = () => res();
          delReq.onerror = () => rej(delReq.error);
          delReq.onblocked = () => rej(new Error('Delete blocked'));
        });
      });
      return Promise.all(deletions);
    }).then(() => resolve())
    .catch(reject);
  });
}