(params, api) => {
	console.log(params)
	const filename = params[0];
	try {
		function binToStr(bin) {
			console.log("bin read", bin);
			if (bin == null)
				return `File not found: ${typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope}`
			const view = new DataView(bin);
			console.log("view read", view);
			let str = "";

			for (let i = 0; i < view.byteLength; i++) {
				str += String.fromCharCode(view.getInt8(i));
			}

			return str;
		}

		return api.readFile(filename).then(content => `%type:pure_text%${binToStr(content)}%type: pure_text_end%` ?? `File not found: ${filename}`);
	} catch (error) {
		return `very nasty file: ${filename}`;
	}
}