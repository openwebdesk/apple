async (params, api) => {
	const w = 300;
	const h = 150;
	const surface = await api.graphics.create({ width: w, height: h });

	const rw = 40;
	const rh = 30;

	let rx = 0;
	let ry = 0;

	let score = 0;
	const cliLine = await api.cli.write("0");

	const spawn = () => {
		rx = Math.random() * (w - rw);
		ry = Math.random() * (h - rh);
	};

	const render = async () => {
		 api.graphics.begin(surface);
		 api.graphics.drawRect(surface, rx, ry, rw, rh, "#e33");
		 api.graphics.end(surface);
	};

	spawn();
	await render();

	await api.events.on("graphics.click");

	onmessage = async e => {
		if (e.data.type !== "event") return;
		if (e.data.event !== "graphics.click") return;

		const { id, x, y } = e.data.data;
		if (id !== surface) return;
		if (x < rx || y < ry || x > rx + rw || y > ry + rh) return;

		score++;
		api.cli.edit(cliLine, String(score));
		spawn();
					console.log("drawr")
		await render();
	};
}