async (params, api) => {
	const surface = await api.graphics.create({ width: 300, height: 150 });

	for (let i = 0; i <= 100; i++) {
		await api.graphics.begin(surface);
		await api.graphics.drawRect(surface, 0, 0, 300, 150, "#111");
		await api.graphics.drawRect(surface, 10, 60, i * 2.8, 30, "#4caf50");
		await api.graphics.end(surface);
		await new Promise(r => setTimeout(r, 30));
	}

	await api.graphics.destroy(surface);
	api.cli.write("graphics test done");
}
