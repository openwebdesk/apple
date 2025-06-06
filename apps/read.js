(params, api) => {
	const filename = params[0];
 
	function binToStr(bin) {
		const view = new DataView(bin);
		let str = "";
 
		 for (let i = 0; i < view.byteLength; i++) {
			 str += String.fromCharCode(view.getInt8(i));
		 }
 
		 return str;
	}

   return api.readFile(filename).then(content => `%type:pure_text%${binToStr(content)}` ?? `[File not found: ${filename}]`);
}