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
        return "Open Web CLI is a web based Command Line Interface for a local app and file storage ecosystem. Withought a graphic interface, OWC helps developers write functional programs with minimal effort. It also helps users navigate through and use their files as params very easily.\n\nThis is the syntax for a command:\n%type:code_block%<app_name / system command> <parameters seperated with spaces>";\nfor parameters including spaces, use double quotes (\").
    }`;

    const defaultReadApp = `(params, api) => {
  const filename = params[0];
  return api.readFile(filename).then(content => content ?? \`[File not found: \${filename}]\`);
}`;

const defaulteraseApp = `() => {}`

    if (!vfs.getFile('root/apps/help.js')) await vfs.writeFile('root/apps/help.js', defaultHelpApp);
    if (!vfs.getFile('root/apps/read.js')) await vfs.writeFile('root/apps/read.js', defaultReadApp);
    if (!vfs.getFile('root/apps/read.js')) await vfs.writeFile('root/apps/read.js', defaulteraseApp);

    new CLI(vfs, inputtxtar, display, current);
})();