async (params, api) => {
	const filename = params[0];
	const id = await api.cli.write("Reading file... 00%");
	try {
		async function binToStr(bin) {
			api.cli.edit(id, "Reading file... 30%");
			if (bin == null)
				return `File not found: ${typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope}`
			const view = new DataView(bin);
			let str = "";

			for (let i = 0; i < view.byteLength; i++) {
				str += String.fromCharCode(view.getInt8(i));
			}
			await api.cli.edit(id, `%font-size:10px; color:#ababab;%${filename}`);

			return str;
		}


		return api.files.get(filename).then(async (content) => {
			await api.cli.write(`%type:pure_text%${await binToStr(content)}%type: pure_text_end%` ?? `File not found: ${filename}}`);
		});
	} catch (error) {
		return `very nasty file: ${filename}`;
	}
}