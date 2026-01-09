import { VirtualFS } from "./filesystem.js";
import { CLI } from "./cli.js";
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

async function initializeApple() {
	const vfs = new VirtualFS();
	await vfs.loadFromStorage();
	const files = [
		["root/apps/help.js", "apps/help.js"],
		["root/apps/read.js", "apps/read.js"],
		["root/apps/gra.js", "apps/gra.js"],
		["root/apps/fetch.js", "apps/fetch.js"],
		["root/apps/ginst.js", "apps/ginst.js"],
		["root/system/settings.json", "sys/defsysset.json"]
	];

	await Promise.all(
		files.map(async ([dst, src]) => {
			if (vfs.getFile(dst)) return;
			const res = await fetch(src);
			await vfs.writeFile(dst, strToBin(await res.text()));
		})
	);

	new CLI(vfs, inputtxtar, display, current);
}

initializeApple();