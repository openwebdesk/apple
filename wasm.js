export class WASM {
	constructor(vfs) {
		this.vfs = vfs;
	}

	async load(path) {
		const data = await this.vfs.readFile(path);
		if (!data) return null;

		console.log("wasm load data:", data);
		return await WebAssembly.compile(data);
	}

}
