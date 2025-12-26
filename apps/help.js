async (params, api) => {
	const total = 20;
	let current = 0;
	const id = await api.cli.write("[--------------------] 0%");

	const timer = setInterval(async () => {
		current++;
		const filled = "#".repeat(current);
		const empty = "-".repeat(total - current);
		const percent = Math.round((current / total) * 100);
		await api.cli.edit(id, `[${filled}${empty}] ${percent}%`);
		if (current === total) clearInterval(timer);
	}, 100);
}
