export class CLI {
    constructor(vfs, inputElement, displayElement, currentDirElement) {
        this.vfs = vfs;
        this.input = inputElement;
        this.display = displayElement;
        this.currentDirElement = currentDirElement;
        this.cwd = 'root';
        this._bindInput();
        this._updateCurrentDir();
    }

    _bindInput() {
        this.input.addEventListener("keydown", async (e) => {
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
        const dirColored = `%color: #90ff90%${this.cwd}%color: white%`;
        const [cmd, ...args] = command.split(/\s+/);
        const cmdColored = `%color: #ffd13b%${cmd}%color: white%`;
        const paramsColored = `%color: #7696ff%${args.join(' ')}%color: white%`;

        this._appendToDisplay(`${dirColored} > ${cmdColored} ${paramsColored}`);

        switch (cmd) {
            case 'cd':
                this._handleCd(args[0]);
                break;
            case 'ls':
                this._handleLs(args[0]);
                break;
            case 'mkdir':
                this._handleMkdir(args[0]);
                break;
            case 'mkfile':
                this._handleMkfile(args[0], args.slice(1).join(' '));
                break;
            case 'rm':
                this._handleRm(args[0]);
                break;
            case 'cls':
                this._handleCls(args[0]);
                break;
            case 'clearIDB':
                this._handleCLRIDB();
                break;
            default:
                await this._runApp(cmd, args);
                break;
        }

    }

    _handleCLRIDB() {
        this.vfs.clearfs()
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
        this.vfs.writeFile(fullPath, '__folder__');
        this._appendToDisplay(`Created folder ${fullPath}`);
    }

    _handleMkfile(name, content = '') {
        if (!name) return this._appendToDisplay("Usage: mkfile <filename> [content]");
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
        if (entry == null) return this._appendToDisplay(`No such file or directory: ${name}`);

        if (entry === '__folder__') {
            const contents = this.vfs.listDirectory(fullPath);
            if (contents.length > 0) {
                return this._appendToDisplay(`Directory not empty: ${name}`);
            }
        }

        this.vfs.deleteFile(fullPath);
        this._appendToDisplay(`Removed ${fullPath}`);
    }

    async _handleLs(pathArg) {
        const path = this._resolvePath(pathArg || '');
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
        const path = rawPath?.trim().replace(/^"(.*)"$/, '$1') || '';

        let targetPath;
        if (path === '' || path === '.') {
            targetPath = this.cwd;
        } else if (path === '..') {
            const parts = this.cwd.split('/');
            parts.pop();
            targetPath = parts.join('/') || 'root';
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
        if (!path || path === '') return this.cwd;
        if (path.startsWith('root/')) return path;
        if (path.startsWith('/')) return 'root' + path;

        const parts = this.cwd.split('/').concat(path.split('/'));
        const resolved = [];
        for (const part of parts) {
            if (part === '' || part === '.') continue;
            if (part === '..') resolved.pop();
            else resolved.push(part);
        }
        return resolved.join('/');
    }

    _clearDisplay() {
        this.display.innerHTML = ``;
    }

    _appendToDisplay(text) {
        function escapeHtml(str) {
            return str.replace(/[&<>"']/g, (m) => {
                switch (m) {
                    case '&': return '&amp;';
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '"': return '&quot;';
                    case "'": return '&#39;';
                }
            });
        }

        const regex = /%color: ([^%]+)%/g;
        let lastIndex = 0;
        let match;
        let resultHtml = '';

        const parts = [];
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ text: text.slice(lastIndex, match.index), color: null });
            }
            lastIndex = regex.lastIndex;

            const nextMatch = regex.exec(text);
            const colorTextEnd = nextMatch ? nextMatch.index : text.length;

            parts.push({
                text: text.slice(lastIndex, colorTextEnd),
                color: match[1].trim()
            });

            if (nextMatch) {
                regex.lastIndex = nextMatch.index;
                lastIndex = nextMatch.index;
            } else {
                lastIndex = colorTextEnd;
                break;
            }
        }

        if (lastIndex < text.length) {
            parts.push({ text: text.slice(lastIndex), color: null });
        }

        for (const part of parts) {
            if (part.color) {
                resultHtml += `<span style="color:${part.color}">${escapeHtml(part.text)}</span>`;
            } else {
                resultHtml += escapeHtml(part.text);
            }
        }

        const line = document.createElement('div');
        line.innerHTML = resultHtml;
        this.display.appendChild(line);
    }


    async _runApp(appName, params) {
        const appPath = `root/apps/${appName}.js`;
        const appCode = await this.vfs.readFile(appPath);
        if (!appCode) {
            this._appendToDisplay(`App not found: ${appName}`);
            return;
        }

        return new Promise((resolve) => {
            const worker = new Worker('worker.js');

            worker.onmessage = (event) => {
                const { type, id, method, params, success, result, error } = event.data;

                if (type === 'apiRequest') {
                    if (method === 'readFile') {
                        const fullPath = this._resolvePath(params.filename);
                        this.vfs.readFile(fullPath).then(
                            (fileContent) => {
                                worker.postMessage({ type: 'apiResponse', id, success: true, result: fileContent });
                            },
                            (err) => {
                                worker.postMessage({ type: 'apiResponse', id, success: false, error: err.message });
                            }
                        );
                    }

                } else if (type === 'appResult') {
                    if (success) {
                        this._appendToDisplay(result ?? "[No output]");
                    } else {
                        this._appendToDisplay(`Error running app: ${error}`);
                    }
                    worker.terminate();
                    resolve();
                }
            };

            worker.postMessage({ type: 'runApp', data: { appCode, params } });
        });
    }

    _createSandboxAPI() {
        return {
            readFile: async (filename) => {
                const filePath = `${this.cwd}/${filename}`;
                return await this.vfs.readFile(filePath);
            },
            writeOutput: (text) => {
                this._appendToDisplay(text);
            }
        };
    }

}