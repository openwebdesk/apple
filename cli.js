import { binToStr } from "./bin.js";

export class CLI {
	constructor(vfs, inputElement, displayElement, currentDirElement) {
		this.vfs = vfs;
		this.input = inputElement;
		this.display = displayElement;
		this.currentDirElement = currentDirElement;
		this.cwd = "root";
		this._bindInput();
		this._updateCurrentDir();
	}

	_bindInput() {
		this.input.addEventListener("keydown", async e => {
			if (e.key === "Enter") {
				e.preventDefault();
				const command = this.input.value.trim();
				this.input.value = "";
				this._handleCommand(command);
			}
		});
	}

	_updateCurrentDir() {
		this.currentDirElement.textContent = this.cwd;
	}
	async _handleCommand(command) {
		const args = [];
		let current = "";
		let inQuotes = false;
		let escape = false;

		for (let i = 0; i < command.length; i++) {
			const char = command[i];

			if (escape) {
				current += char;
				escape = false;
			} else if (char === "\\") {
				escape = true;
			} else if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === " " && !inQuotes) {
				if (current.length > 0) {
					args.push(current);
					current = "";
				}
			} else {
				current += char;
			}
		}

		if (current.length > 0) {
			args.push(current);
		}

		const cmd = args.shift();
		const dirColored = `%color: #90ff90%${this.cwd}%color: white%`;
		const cmdColored = `%color: #ffd13b%${cmd}%color: white%`;
		const paramsColored = `%color: #7696ff%${args.join(" ")}%color: white%`;

		this._appendToDisplay(`${dirColored} > ${cmdColored} ${paramsColored}`);

		switch (cmd) {
			case "cd":
				this._handleCd(args[0]);
				break;
			case "ls":
				this._handleLs(args[0]);
				break;
			case "mkdir":
				this._handleMkdir(args[0]);
				break;
			case "mkfile":
				this._handleMkfile(args[0], args.slice(1).join(" "));
				break;
			case "rm":
				this._handleRm(args[0]);
				break;
			case "cls":
				this._handleCls(args[0]);
				break;
			case "clearIDB":
				this._handleCLRIDB();
				break;
			case "upload":
				this._handleUpload(args[0]);
				break;
			default:
				await this._runApp(cmd, args);
				break;
		}
	}

	_handleUpload(path) {
		const input = document.createElement("input");
		input.type = "file";

		input.onchange = ev => {
			/** @type File */
			const file = ev.target.files[0];
			const reader = new FileReader();
			reader.readAsArrayBuffer(file);

			reader.onloadend = async () => {
				if (reader.readyState === reader.DONE) {
					await this.vfs.writeFile(
						(path ? "root/" + path + "/" : "root/") + file.name,
						reader.result
					);
					return;
				}
			};
		};

		input.click();
	}

	_handleCLRIDB() {
		this.vfs.clearfs();
	}

	_parseArgs(command) {
		const regex = /[^\s"]+|"([^"]*)"/g;
		const args = [];
		let match;
		while ((match = regex.exec(command)) !== null) {
			args.push(match[1] !== undefined ? match[1] : match[0]);
		}
		return args;
	}

	_handleMkdir(name) {
		if (!name) return this._appendToDisplay("Usage: mkdir <folder>");
		const fullPath = this._resolvePath(name);
		this.vfs.writeFile(fullPath, "__folder__");
		this._appendToDisplay(`Created folder ${fullPath}`);
	}

	_handleMkfile(name, content = "") {
		if (!name)
			return this._appendToDisplay("Usage: mkfile <filename> [content]");
		const fullPath = this._resolvePath(name);
		this.vfs.writeFile(fullPath, content);
		this._appendToDisplay(`Created file ${fullPath}`);
	}

	_handleCls() {
		this._clearDisplay();
	}

	_handleRm(name) {
		if (!name) return this._appendToDisplay("Usage: rm <fileOrFolder>");
		if (name == "env") {
			clearDB();
		}
		const fullPath = this._resolvePath(name);
		const entry = this.vfs.readFile(fullPath);
		if (entry == null)
			return this._appendToDisplay(`No such file or directory: ${name}`);

		if (entry === "__folder__") {
			const contents = this.vfs.listDirectory(fullPath);
			if (contents.length > 0) {
				return this._appendToDisplay(`Directory not empty: ${name}`);
			}
		}

		this.vfs.deleteFile(fullPath);
		this._appendToDisplay(`Removed ${fullPath}`);
	}

	async _handleLs(pathArg) {
		const path = this._resolvePath(pathArg || "");
		const entries = this.vfs.listDirectory(path);
		if (!entries || entries.length === 0) {
			this._appendToDisplay(`No entries found in ${path}`);
			return;
		}

		for (const entry of entries) {
			this._appendToDisplay(entry);
		}
	}
	async _handleCd(rawPath) {
		const path = rawPath?.trim().replace(/^"(.*)"$/, "$1") || "";

		let targetPath;
		if (path === "" || path === ".") {
			targetPath = this.cwd;
		} else if (path === "..") {
			const parts = this.cwd.split("/");
			parts.pop();
			targetPath = parts.join("/") || "root";
		} else {
			targetPath = this._resolvePath(path);
		}

		if (this.vfs.isDirectory(targetPath)) {
			this.cwd = targetPath;
			this._updateCurrentDir();
			this._appendToDisplay(`Changed directory to ${this.cwd}`);
		} else {
			this._appendToDisplay(`Directory not found: ${rawPath}`);
		}
	}

	_resolvePath(path) {
		if (!path || path === "") return this.cwd;
		if (path.startsWith("root/")) return path;
		if (path.startsWith("/")) return "root" + path;

		const parts = this.cwd.split("/").concat(path.split("/"));
		const resolved = [];
		for (const part of parts) {
			if (part === "" || part === ".") continue;
			if (part === "..") resolved.pop();
			else resolved.push(part);
		}
		return resolved.join("/");
	}

	_clearDisplay() {
		this.display.innerHTML = ``;
	}
	_renderLines(text, linescont) {
		function escapeHtml(str) {
			return str.replace(/[&<>"']/g, m => {
				switch (m) {
					case "&": return "&amp;";
					case "<": return "&lt;";
					case ">": return "&gt;";
					case '"': return "&quot;";
					case "'": return "&#39;";
				}
			});
		}

		linescont.innerHTML = "";
		const lines = text.split("\n");
		let inPureText = false;

		for (const lineText of lines) {
			let resultHtml = "";

			if (inPureText) {
				const endIdx = lineText.indexOf("%pure_text_end%");
				if (endIdx !== -1) {
					resultHtml += escapeHtml(lineText.slice(0, endIdx));
					inPureText = false;
					resultHtml += this._formatStyledText(lineText.slice(endIdx + 15));
				} else {
					resultHtml += escapeHtml(lineText);
				}
			} else {
				const startIdx = lineText.indexOf("%type:pure_text%");
				if (startIdx !== -1) {
					resultHtml += this._formatStyledText(lineText.slice(0, startIdx));
					inPureText = true;
					resultHtml += escapeHtml(lineText.slice(startIdx + 16));
				} else {
					resultHtml += this._formatStyledText(lineText);
				}
			}

			const line = document.createElement("div");
			line.innerHTML = resultHtml;
			linescont.appendChild(line);
		}
	}

	_appendToDisplay(text) {
		const id = randomString(16);
		const linescont = document.createElement("div");
		linescont.setAttribute("data-line-id", id);
		this._renderLines(text, linescont);
		this.display.appendChild(linescont);
		return id;
	}

	_appendCanvasToUI(canvas) {
		this.display.appendChild(canvas);
	}

	_editInDisplay(id, text) {
		const linescont = this.display.querySelector(`[data-line-id="${id}"]`);
		if (!linescont) return;
		this._renderLines(text, linescont);
	}

	_formatStyledText(lineText) {
		const regex = /%([^%]+)%/g;
		let lastIndex = 0;
		let match;
		let resultHtml = "";
		let currentStyle = null;

		while ((match = regex.exec(lineText)) !== null) {
			if (match.index > lastIndex) {
				resultHtml += this._span(
					lineText.slice(lastIndex, match.index),
					currentStyle
				);
			}

			const directives = match[1].split(";").map(s => s.trim()).filter(Boolean);
			const styleObj = {};
			for (const d of directives) {
				const [k, v] = d.split(":").map(s => s.trim());
				if (k && v) styleObj[k] = v;
			}
			currentStyle = styleObj;
			lastIndex = regex.lastIndex;
		}

		if (lastIndex < lineText.length) {
			resultHtml += this._span(
				lineText.slice(lastIndex),
				currentStyle
			);
		}

		return resultHtml;
	}

	_span(text, style) {
		const esc = text.replace(/[&<>"']/g, m => {
			switch (m) {
				case "&": return "&amp;";
				case "<": return "&lt;";
				case ">": return "&gt;";
				case '"': return "&quot;";
				case "'": return "&#39;";
			}
		});

		if (!style) return esc;

		const styles = [];
		for (const [k, v] of Object.entries(style)) {
			if (k === "type" && v === "code_block") {
				styles.push(
					"background:#1f1f1f",
					"padding:5px 7px",
					"border-radius:4px",
					"display:inline-block",
					"border:1px solid #363636",
					"white-space:pre"
				);
			} else {
				styles.push(`${k}:${v}`);
			}
		}

		return `<span style="${styles.join("; ")}">${esc}</span>`;
	}


	async _runApp(appName, params) {
		const appPath = `root/apps/${appName}.js`;
		const appCode = await this.vfs.readFile(appPath);
		if (!appCode) {
			this._appendToDisplay(`App not found: ${appName}`);
			return;
		}

		const workerSrc = `
	const pending = new Map();
	let rid = 0;

	const createApiProxy = (path = []) => {
		return new Proxy(() => {}, {
			get(_, prop) {
				return createApiProxy([...path, prop]);
			},
			apply(_, __, args) {
				for (const a of args) {
					if (a && typeof a === "object" && typeof a.then === "function") {
						throw new Error("Promise passed to worker API");
					}
				}
				return new Promise((res, rej) => {
					const id = rid++;
					pending.set(id, { res, rej });
					postMessage({ type: "apiRequest", id, path, args });
				});
			}
		});
	};

	const api = createApiProxy();

	onmessage = async e => {
		const { type, data, id } = e.data;

		if (type === "runApp") {
			try {
				const fn = new Function("params", "api", \`"use strict"; return (\${data.appCode})(params, api);\`);
				const result = await fn(data.params, api);
				result: typeof result === "string" ? result : JSON.stringify(result)
			} catch (err) {
				postMessage({ type: "appResult", success: false, error: err.message });
			}
		}

		if (type === "apiResponse") {
			const p = pending.get(id);
			if (!p) return;
			e.data.success ? p.res(e.data.result) : p.rej(new Error(e.data.error));
			pending.delete(id);
		}
	};
`;

		const url = URL.createObjectURL(new Blob([workerSrc], { type: "application/javascript" }));
		const worker = new Worker(url);

		return new Promise(resolve => {
			const canvases = new Map();
			let nextSurface = 1;

			const graphics = {
				create: async ([opts]) => {
					const id = nextSurface++;
					const canvas = document.createElement("canvas");
					canvas.width = opts.width;
					canvas.height = opts.height;
					const ctx = canvas.getContext("2d");
					this._appendCanvasToUI(canvas);
					canvases.set(id, { canvas, ctx, cmds: [] });
					return id;
				},
				begin: async ([id]) => {
					const s = canvases.get(id);
					if (!s) throw new Error("surface");
					s.cmds.length = 0;
				},
				drawRect: async ([id, x, y, w, h, color]) => {
					const s = canvases.get(id);
					if (!s) throw new Error("surface");
					s.cmds.push({ t: "r", x, y, w, h, c: color });
				},
				end: async ([id]) => {
					const s = canvases.get(id);
					if (!s) throw new Error("surface");
					const ctx = s.ctx;
					ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
					for (const c of s.cmds) {
						if (c.t === "r") {
							ctx.fillStyle = c.c;
							ctx.fillRect(c.x, c.y, c.w, c.h);
						}
					}
				},
				destroy: async ([id]) => {
					const s = canvases.get(id);
					if (!s) return;
					s.canvas.remove();
					canvases.delete(id);
				}
			};

			const apiTree = {
				files: {
					get: async ([name]) => {
						const full = this._resolvePath(name);
						return this.vfs.readFile(full);
					}
				},
				cli: {
					write: async ([text]) => {
						return this._appendToDisplay(text);
					},
					edit: async ([id, text]) => {
						return this._editInDisplay(id, text);
					}
				},
				graphics,
				network: {
					fetchText: async ([url]) => {
						const res = await fetch(url)
						return await res.text()
					}
				}

			};

			const resolveApi = (tree, path) =>
				path.reduce((n, k) => n?.[k], tree);

			worker.onmessage = async e => {
				const { type, id, path, args, success, result, error } = e.data;

				if (type === "apiRequest") {
					try {
						const fn = resolveApi(apiTree, path);
						if (typeof fn !== "function") throw new Error(path.join("."));
						const r = await fn(args);
						worker.postMessage({ type: "apiResponse", id, success: true, result: r });
					} catch (err) {
						worker.postMessage({ type: "apiResponse", id, success: false, error: err.message });
					}
					return;
				}

				if (type === "appResult") {
					this._appendToDisplay(success ? result ?? "[No output]" : `Error running app: ${error}`);
					worker.terminate();
					URL.revokeObjectURL(url);
					resolve();
				}
			};

			worker.postMessage({
				type: "runApp",
				data: { appCode: binToStr(appCode), params }
			});
		});

	}
}

function randomString(len) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let out = '';
	for (let i = 0; i < len; i++) {
		out += chars[Math.floor(Math.random() * chars.length)];
	}
	return out;
}
