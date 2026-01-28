async (params, api) => {
	const w = 400;
	const h = 300;
	const surface = await api.graphics.create({ width: w, height: h });

	const wordFallSpeed = 1;
	let score = 0;
	const cliScore = await api.cli.write("Score: 0");
	let gameOver = false;

	const words = [
		"Google", "Facebook", "Twitter", "Instagram", "TikTok", "Snapchat", "LinkedIn", "YouTube", "Reddit", "Pinterest",
		"Zoom", "Slack", "Spotify", "Netflix", "Discord", "GitHub", "StackOverflow", "Medium", "Quora", "Trello",
		"run", "jump", "swim", "think", "write", "read", "code", "paint", "sing", "dance",
		"laugh", "cry", "smile", "frown", "shout", "whisper", "dream", "sleep", "create", "destroy",
		"happy", "sad", "angry", "excited", "anxious", "curious", "bored", "confident", "nervous", "proud",
		"joy", "fear", "love", "hate", "envy", "guilt", "relief", "surprise", "trust", "shame",
		"atom", "molecule", "gravity", "energy", "neuron", "quantum", "gene", "virus", "bacteria", "cell",
		"photosynthesis", "evolution", "neutron", "electron", "proton", "blackhole", "galaxy", "planet", "star", "climate",
		"Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hannah", "Ivy", "Jack",
		"Kevin", "Laura", "Mona", "Nina", "Oscar", "Paul", "Quinn", "Rachel", "Sam", "Tina",
		"USA", "Canada", "Brazil", "Mexico", "France", "Germany", "Italy", "Spain", "Japan", "China",
		"India", "Russia", "Egypt", "SouthAfrica", "Nigeria", "Kenya", "Australia", "NewZealand", "Argentina", "Chile",
		"algorithm", "database", "server", "client", "network", "protocol", "function", "variable", "loop", "array",
		"binary", "digital", "quantum", "AI", "ML", "blockchain", "crypto", "robotics", "simulation", "experiment",
		"mountain", "river", "ocean", "desert", "forest", "island", "volcano", "canyon", "valley", "glacier",
		"puzzle", "challenge", "game", "quest", "adventure", "journey", "mission", "task", "goal", "plan",
		"light", "dark", "fire", "water", "earth", "air", "wind", "storm", "cloud", "rain",
		"sun", "moon", "star", "planet", "comet", "asteroid", "nebula", "cosmos", "universe", "orbit",
		"music", "art", "literature", "history", "math", "physics", "chemistry", "biology", "psychology", "philosophy",
		"economics", "politics", "sociology", "anthropology", "geography", "linguistics", "engineering", "medicine", "law", "education",
		"car", "bike", "plane", "train", "ship", "boat", "scooter", "bus", "truck", "subway",
		"coffee", "tea", "water", "juice", "soda", "bread", "cheese", "meat", "vegetable", "fruit",
		"red", "blue", "green", "yellow", "purple", "orange", "black", "white", "gray", "pink",
		"run", "jump", "swim", "dance", "sing", "think", "create", "explore", "discover", "invent"
	];

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
			const lengthFactor = 10 / word.text.length;
			word.y += wordFallSpeed * lengthFactor;
			if (word.y > h - 20) {
				gameOver = true;
				await api.cli.write("GAME OVER");
				apple.end();
				return;
			}
		}

		await render();
	};

	const inputLoop = async () => {
		while (!gameOver) {
			const input = await api.cli.ask("Type word:", "");
			const index = fallingWords.findIndex(w => w.text.toLowerCase() === input.toLowerCase());
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