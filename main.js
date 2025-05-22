import { VirtualFS } from './filesystem.js';
import { CLI } from './cli.js';

const inputtxtar = document.getElementById("input");
const display = document.getElementById("logs");
const current = document.getElementById("currently");

const resizeTextarea = () => {
    inputtxtar.style.height = "auto";
    inputtxtar.style.height = inputtxtar.scrollHeight + "px";
};

inputtxtar.addEventListener("input", resizeTextarea);

(async () => {
    const vfs = new VirtualFS();
    await vfs.loadFromStorage();

   const defaultHelpApp = `(params, api) => {
    return \`%type: pure_text% hello %font-size: 24px% world %type: pure_text_end%\`;
}`;

    const defaultReadApp = `(params, api) => {
  const filename = params[0];
  return api.readFile(filename).then(content => \`\%type:pure_text%\${content}\` ?? \`[File not found: \${filename}]\`);
}`;

const defaulteraseApp = `() => {}`

    if (!vfs.getFile('root/apps/help.js')) await vfs.writeFile('root/apps/help.js', defaultHelpApp);
    if (!vfs.getFile('root/apps/read.js')) await vfs.writeFile('root/apps/read.js', defaultReadApp);
    if (!vfs.getFile('root/apps/read.js')) await vfs.writeFile('root/apps/read.js', defaulteraseApp);

    new CLI(vfs, inputtxtar, display, current);
})();