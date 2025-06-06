import { VirtualFS } from "./filesystem.js";
import { CLI } from "./cli.js";
import { WASM } from "./wasm.js";
import { strToBin } from "./bin.js";

const inputtxtar = document.getElementById("input");
const display = document.getElementById("logs");
const current = document.getElementById("currently");

const resizeTextarea = () => {
	inputtxtar.style.height = "auto";
	inputtxtar.style.height = inputtxtar.scrollHeight + "px";
};

inputtxtar.addEventListener("input", resizeTextarea);
inputtxtar.focus();

(async () => {
	const vfs = new VirtualFS();
	await vfs.loadFromStorage();
	const wasm = new WASM(vfs);

	const defaulteraseApp = `() => {}`;

	if (!vfs.getFile("root/apps/help.js"))
		await vfs.writeFile(
			"root/apps/help.js",
			strToBin(await (await fetch("/apps/help.js")).text())
		);

	if (!vfs.getFile("root/apps/read.js"))
		await vfs.writeFile(
			"root/apps/read.js",
			strToBin(await (await fetch("/apps/read.js")).text())
		);

	if (!vfs.getFile("root/apps/read.js"))
		await vfs.writeFile("root/apps/read.js", strToBin(defaulteraseApp));

	new CLI(vfs, wasm, inputtxtar, display, current);
})();
