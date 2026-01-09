async (params, api) => {
	let w = 420;
	let h = 260;
	let surface = await api.graphics.create({ width: w, height: h });

	let src = "\n\n\n";
	for (let element of ["basics", "cli"]) {
		src += "\n# " + element + "\n---\n";
		src += await api.network.fetchText("docs/" + element + ".md");
	}
	src = "\n\n" + src;
	let lines = src.split("\n");

	let scroll = 0;
	let target = 0;
	let anim = false;
	let lh = 16;
	let margin = 8;
	let wrapW = w - 16;

	const step = async () => {
		if (!anim) return;
		scroll += (target - scroll) * 0.25;
		if (Math.abs(target - scroll) < 0.5) {
			scroll = target;
			anim = false;
		}
		await render();
		if (anim) requestAnimationFrame(step);
	};

	const scrollTo = v => {
		target = Math.max(0, v);
		if (!anim) {
			anim = true;
			requestAnimationFrame(step);
		}
	};

	let upBtn = { x: w - 60, y: 8, w: 52, h: 20 };
	let downBtn = { x: w - 60, y: 32, w: 52, h: 20 };

	const wrap = (text, size) => {
		let out = [];
		let cur = "";
		for (let word of text.split(" ")) {
			let next = cur ? cur + " " + word : word;
			if (next.length * size * 0.6 > wrapW) {
				out.push(cur);
				cur = word;
			} else {
				cur = next;
			}
		}
		if (cur) out.push(cur);
		return out;
	};

	const parseLineInline = (line) => {
		let patterns = [
			{ regex: /\*\*(.+?)\*\*/g, type: "bold" },
			{ regex: /\*(.+?)\*/g, type: "italic" },
			{ regex: /_(.+?)_/g, type: "italic" },
			{ regex: /__(.+?)__/g, type: "underline" },
			{ regex: /`(.+?)`/g, type: "keybind" }
		];
		let segments = [];
		let lastIndex = 0;
		let matches = [];
		patterns.forEach(p => {
			let m;
			while ((m = p.regex.exec(line)) !== null) matches.push({ ...p, start: m.index, end: m.index + m[0].length, content: m[1] });
		});
		matches.sort((a, b) => a.start - b.start);
		for (let m of matches) {
			if (m.start > lastIndex) segments.push({ t: line.slice(lastIndex, m.start) });
			segments.push({ t: m.content, [m.type]: true });
			lastIndex = m.end;
		}
		if (lastIndex < line.length) segments.push({ t: line.slice(lastIndex) });
		return segments;
	};

	const parse = () => {
		let out = [];
		let inCode = false;
		for (let line of lines) {
			if (line.startsWith("```")) {
				inCode = !inCode;
				continue;
			}
			if (inCode) {
				out.push([{ t: line, size: 12, color: "#9f9", mono: true, bg: "#222" }]);
				continue;
			}
			let baseSize = 12, bold = false;
			if (line.startsWith("#### ")) { baseSize = 12; bold = true; line = line.slice(5); }
			else if (line.startsWith("### ")) { baseSize = 14; bold = true; line = line.slice(4); }
			else if (line.startsWith("## ")) { baseSize = 16; bold = true; line = line.slice(3); }
			else if (line.startsWith("# ")) { baseSize = 18; bold = true; line = line.slice(2); }

			let segments = parseLineInline(line).map(s => ({ ...s, size: baseSize, bold: bold || s.bold, color: s.color || "#ddd" }));
			out.push(segments);
		}
		return out;
	};

	let blocks = parse();

	const render = async () => {
		api.graphics.begin(surface);
		api.graphics.clear(surface);
		let y = margin - scroll;

		for (let block of blocks) {
			for (let segment of block) {
				let wrapped = wrap(segment.t, segment.size || 12);
				for (let wline of wrapped) {
					let color = segment.color || "#ddd";
					if (segment.keybind) color = "#ff9";
					if (segment.bg) api.graphics.drawRect(surface, margin - 4, y - segment.size, wrapW + 8, lh, segment.bg);
					let fontStyle = "";
					if (segment.bold) fontStyle += "bold ";
					if (segment.italic) fontStyle += "italic ";
					if (segment.underline) fontStyle += "underline ";
					api.graphics.drawText(surface, wline, margin, y, color, segment.size || 12, fontStyle);
					y += lh;
				}
				y += 4;
			}
		}

		api.graphics.drawRect(surface, upBtn.x, upBtn.y, upBtn.w, upBtn.h, "#444");
		api.graphics.drawRect(surface, downBtn.x, downBtn.y, downBtn.w, downBtn.h, "#444");
		api.graphics.drawText(surface, "UP", upBtn.x + 16, upBtn.y + 14, "#fff", 12);
		api.graphics.drawText(surface, "DOWN", downBtn.x + 6, downBtn.y + 14, "#fff", 12);

		api.graphics.end(surface);
	};

	await render();
	await api.events.on("graphics.click");

	onmessage = async e => {
		if (e.data.type !== "event") return;
		if (e.data.event !== "graphics.click") return;
		let { id, x, y } = e.data.data;
		if (id !== surface) return;

		if (x >= upBtn.x && y >= upBtn.y && x <= upBtn.x + upBtn.w && y <= upBtn.y + upBtn.h) {
			scrollTo(scroll - lh * 6);
			return;
		}
		if (x >= downBtn.x && y >= downBtn.y && x <= downBtn.x + downBtn.w && y <= downBtn.y + downBtn.h) {
			scrollTo(scroll + lh * 6);
			return;
		}
	};
}
