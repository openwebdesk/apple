async (params, api) => {
    let w = 480;
    let h = 320;
    let surface = await api.graphics.create({ width: w, height: h });

    let html = await api.network.fetchText(params[0]);

    let scroll = 0;
    let target = 0;
    let anim = false;
    let lh = 18;
    let margin = 8;
    let wrapW = w - 16;

    let links = [];

    const step = async () => {
        if (!anim) return;
        scroll += (target - scroll) * 0.25;
        if (Math.abs(target - scroll) < 0.5) { scroll = target; anim = false; }
        await render();
        if (anim) requestAnimationFrame(step);
    };

    const scrollTo = v => {
        target = Math.max(0, v);
        if (!anim) { anim = true; requestAnimationFrame(step); }
    };

    let upBtn = { x: w - 60, y: 8, w: 52, h: 20 };
    let downBtn = { x: w - 60, y: 32, w: 52, h: 20 };

    const wrap = (text, size) => {
        let out = [], cur = "";
        for (let word of text.split(" ")) {
            let next = cur ? cur + " " + word : word;
            if (next.length * size * 0.6 > wrapW) { out.push(cur); cur = word; } 
            else cur = next;
        }
        if (cur) out.push(cur);
        return out;
    };

    const parseHTML = (html) => {
        html = html.replace(/\n/g, " ").replace(/<br\s*\/?>/gi, "\n");
        let out = [];
        let regex = /<(\/?)(\w+)([^>]*)>|([^<]+)/g;
        let stack = [];
        let current = { bold: false, italic: false, underline: false, mono: false, color: "#ddd", size: 14, href: null };

        let match;
        while ((match = regex.exec(html)) !== null) {
            if (match[4]) { // text node
                let text = match[4];
                text.split("\n").forEach(line => out.push([{ t: line, ...current }]));
            } else {
                let closing = match[1] === "/";
                let tag = match[2].toLowerCase();
                let attrs = match[3];

                if (!closing) { // opening tag
                    stack.push({ ...current });
                    if (tag === "b" || tag === "strong") current.bold = true;
                    if (tag === "i" || tag === "em") current.italic = true;
                    if (tag === "u") current.underline = true;
                    if (tag === "code") { current.mono = true; current.bg = "#222"; current.color = "#9f9"; }
                    if (tag.match(/^h[1-6]$/)) { current.bold = true; current.size = 20 - parseInt(tag[1]) * 2; }
                    if (tag === "a") {
                        let hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
                        if (hrefMatch) current.href = hrefMatch[1];
                    }
                    if (tag === "p") out.push([{ t: "" }]);
                } else { // closing tag
                    let prev = stack.pop();
                    if (tag === "a" && current.href) current.href = null;
                    current = prev;
                }
            }
        }

        return out;
    };

    let blocks = parseHTML(html);

    const render = async () => {
        api.graphics.begin(surface);
        api.graphics.clear(surface);
        let y = margin - scroll;
        links = [];

        for (let block of blocks) {
            for (let seg of block) {
                let size = seg.size || 14;
                let wrapped = wrap(seg.t, size);
                for (let line of wrapped) {
                    let color = seg.color || "#ddd";
                    if (seg.href) color = "#4af";
                    if (seg.bg) api.graphics.drawRect(surface, margin - 4, y - size, wrapW + 8, lh, seg.bg);
                    let fontStyle = "";
                    if (seg.bold) fontStyle += "bold ";
                    if (seg.italic) fontStyle += "italic ";
                    if (seg.underline) fontStyle += "underline ";
                    api.graphics.drawText(surface, line, margin, y, color, size, fontStyle);
                    if (seg.href) links.push({ x: margin, y: y - size, w: wrapW, h: lh, href: seg.href });
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
        if (e.data.type !== "event" || e.data.event !== "graphics.click") return;
        let { id, x, y } = e.data.data;
        if (id !== surface) return;

        if (x >= upBtn.x && y >= upBtn.y && x <= upBtn.x + upBtn.w && y <= upBtn.y + upBtn.h) scrollTo(scroll - lh * 6);
        else if (x >= downBtn.x && y >= downBtn.y && x <= downBtn.x + downBtn.w && y <= downBtn.y + downBtn.h) scrollTo(scroll + lh * 6);
        else {
            for (let link of links) {
                if (x >= link.x && y >= link.y && x <= link.x + link.w && y <= link.y + link.h) {
                    api.cli.write("Clicked: " + link.href);
                }
            }
        }
    };
}