async (params, api) => {
	const filename = params[0];
	const id = await api.cli.write("Reading file... 00%");
	try {
		const content = await api.files.get(filename);
		if (!content) return `File not found: ${filename}`;
		const text = new TextDecoder().decode(content);
		await api.cli.write(`%type:pure_text%${text}%pure_text_end%`);

		await api.cli.edit(id, `%font-size:10px; color:#ababab;%${filename}`);
		apple.end();
	} catch (error) {
		return `Error reading file, "${filename}": ${error}`;
	}
}