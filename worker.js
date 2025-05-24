// Store pending API call promises by ID
const pendingRequests = new Map();
let requestId = 0;

self.onmessage = async (e) => {
    const { type, data, id } = e.data;

    if (type === 'runApp') {
        const { appCode, params } = data;

        const api = {
            readFile: (filename) => sendApiRequest('readFile', { filename }),
        };

        function sendApiRequest(method, params) {
            return new Promise((resolve, reject) => {
                const currentId = requestId++;
                pendingRequests.set(currentId, { resolve, reject });
                self.postMessage({ type: 'apiRequest', id: currentId, method, params });
            });
        }

        try {
            const appFn = new Function('params', 'api', `"use strict"; return (${appCode})(params, api);`);
            const result = await appFn(params, api);
            self.postMessage({ type: 'appResult', success: true, result });
        } catch (error) {
            self.postMessage({ type: 'appResult', success: false, error: error.message });
        }
    } else if (type === 'apiResponse') {
        const { success, result, error, id } = e.data;
        const pending = pendingRequests.get(id);
        if (!pending) return;
        if (success) pending.resolve(result);
        else pending.reject(new Error(error));
        pendingRequests.delete(id);
    }

};
