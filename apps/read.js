(params, api) => {
	const filename = params[0];
 
	 /**
	 * @param {ArrayBuffer} bin
	 * @returns {string}
	 */
	function binToStr(bin) {
		console.log("bin read", bin);
		const view = new DataView(bin);
		console.log("view read", view);
		let str = "";

		for (let i = 0; i < view.byteLength; i++) {
			str += String.fromCharCode(view.getInt8(i));
		}

		return str;
	}

   return api.readFile(filename).then(content => `%type:pure_text%${binToStr(content)}` ?? `[File not found: ${filename}]`);
}