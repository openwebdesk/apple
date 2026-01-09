async (params, api) => {
	const w = 400;
	const h = 300;
	const surface = await api.graphics.create({ width: w, height: h });

	const wordFallSpeed = 1;
	let score = 0;
	const cliScore = await api.cli.write("Score: 0");
	let gameOver = false;

	const words = ["apple", "banana", "cherry", "date", "fig", "grape", "kiwi"];
	let fallingWords = [];

	const spawnWord = () => {
		const text = words[Math.floor(Math.random() * words.length)];
		const x = Math.random() * (w - 80);
		fallingWords.push({ text, x, y: 0 });
	};
const render = async () => {
    api.graphics.begin(surface);
    api.graphics.clear(surface);
    const height = h;
    for (const word of fallingWords) {
        const factor = Math.min(1, word.y / height);
        const gb = Math.floor(255 * (1 - factor));
        api.graphics.drawText(surface, word.text, word.x, word.y, `rgba(255,${gb},${gb},1)`, 20);
    }
    api.graphics.end(surface);
};


	const update = async () => {
		if (gameOver) return;

		for (const word of fallingWords) {
			word.y += wordFallSpeed;
			if (word.y > h - 20) {
				gameOver = true;
				await api.cli.write("GAME OVER");
				return;
			}
		}

		await render();
	};

	const inputLoop = async () => {
		while (!gameOver) {
			const input = await api.cli.ask("Type word:", "");
			const index = fallingWords.findIndex(w => w.text === input);
			if (index !== -1) {
				fallingWords.splice(index, 1);
				score++;
				await api.cli.edit(cliScore, "Score: " + score);
			}
		}
	};

	spawnWord();
	render();

	setInterval(() => {
		if (!gameOver) update();
	}, 50);

	setInterval(() => {
		if (!gameOver) spawnWord();
	}, 2000);

	inputLoop();
}