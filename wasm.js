import { VirtualFS } from "./filesystem.js";

export class WASM {
	constructor(vfs) {
		/** @type {VirtualFS} */
		this.vfs = vfs;
	}

	/**
	 * @param {string} path
	 * @returns {Promise<WebAssembly.Module | null>}  */
	async load(path) {
		const data = await this.vfs.readFile(path);
		if (!data) return null;

		console.log("wasm load data:", data);
		return await WebAssembly.compile(data);
	}

	/**
	 * @param {WebAssembly.Module} module
	 * @param {WebAssembly.Imports} imports
	 * @returns {WebAssembly.Instance} */
	async run(module, imports) {
		const instance = await WebAssembly.instantiate(module, imports);

		return instance;
	}
}
