import { VirtualFS } from './filesystem.js';

const inputtxtar = document.getElementById("input");

const resizeTextarea = () => {
    inputtxtar.style.height = "auto";
    inputtxtar.style.height = inputtxtar.scrollHeight + "px";
};

inputtxtar.addEventListener("input", () => {
    resizeTextarea();
});

export async function initSystem() {
    const vfs = new VirtualFS();
    await vfs.loadFromStorage();

    return vfs;
}
