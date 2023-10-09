/* eslint-disable @typescript-eslint/no-use-before-define */
import type DOMParser from 'dom-parser';

export class HtmlDom {
    public constructor(
        private readonly dom: DOMParser.Dom
    ) {}

    public map<U>(callbackFn: (dom: HtmlDom) => U): U {
        return callbackFn(this);
    }

    public nodeById(id: string): HtmlNode {
        return new HtmlNode(this.dom.getElementById(id));
    }

    public nodesByClass(className: string): HtmlNodeList {
        return new HtmlNodeList(this.dom.getElementsByClassName(className));
    }

    public nodesByTag(tagName: string): HtmlNodeList {
        return new HtmlNodeList(this.dom.getElementsByTagName(tagName));
    }
}

export class HtmlNode {
    private readonly node: DOMParser.Node | null;

    public constructor(node?: DOMParser.Node | null) {
        this.node = node ?? null;
    }

    public get children(): HtmlNodeList {
        if (this.node === null)
            return new HtmlNodeList();
        return new HtmlNodeList(this.node.childNodes);
    }

    public get value(): HtmlValue {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-undefined
        if (this.node === null || this.node.childNodes === undefined)
            return new HtmlValue();
        return new HtmlValue(this.node.innerHTML);
    }

    public get text(): string | null {
        if (this.node === null)
            return null;
        return this.node.textContent;
    }

    public get attributes(): { name: string; value: string }[] | null {
        if (this.node === null)
            return null;
        return this.node.attributes as unknown as { name: string; value: string }[];
    }

    public get description(): string {
        // eslint-disable-next-line no-undefined
        return JSON.stringify(this.nodeObject, undefined, 2);
    }

    public get nodeObject(): unknown {
        if (this.node === null)
            return 'null';
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-undefined
        if (this.node.childNodes === undefined)
            return this.node.textContent;
        return this.node.childNodes.map((node, index) => ({
            index: index,
            tag: node.nodeName,
            // eslint-disable-next-line no-undefined
            id: node.getAttribute('id') ?? undefined,
            // eslint-disable-next-line no-undefined
            class: node.getAttribute('class') ?? undefined,
            // eslint-disable-next-line no-undefined
            src: node.getAttribute('src') ?? undefined,
            // eslint-disable-next-line no-undefined
            href: node.getAttribute('href') ?? undefined,
            // eslint-disable-next-line no-undefined, @typescript-eslint/no-unnecessary-condition
            content: node.childNodes === undefined ? node.textContent : undefined,
            // eslint-disable-next-line no-undefined, @typescript-eslint/no-unnecessary-condition
            children: node.childNodes === undefined ? undefined : new HtmlNode(node).nodeObject
        }));
    }

    public map<U>(callbackFn: (node: HtmlNode) => U): U {
        return callbackFn(this);
    }

    public nodeById(id: string): HtmlNode {
        if (this.node === null)
            return new HtmlNode();
        return new HtmlNode(this.node.getElementById(id));
    }

    public nodesByClass(className: string): HtmlNodeList {
        if (this.node === null)
            return new HtmlNodeList();
        return new HtmlNodeList(this.node.getElementsByClassName(className));
    }

    public nodesByTag(tagName: string): HtmlNodeList {
        if (this.node === null)
            return new HtmlNodeList();
        return new HtmlNodeList(this.node.getElementsByTagName(tagName));
    }

    public nthChild(index: number): HtmlNode {
        if (this.node === null)
            return new HtmlNode();
        const nodeList = this.node.childNodes;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-undefined
        if (nodeList === undefined || !Number.isInteger(index) || index < 0 || index >= nodeList.length)
            return new HtmlNode(null);
        return new HtmlNode(nodeList[index]);
    }

    public attribute(key: string): HtmlValue {
        if (this.node === null)
            return new HtmlValue();
        return new HtmlValue(this.node.getAttribute(key));
    }
}

export class HtmlNodeList {
    private readonly nodes: DOMParser.Node[] | null;

    public constructor(nodes?: DOMParser.Node[] | null) {
        this.nodes = nodes ?? null;
    }

    public map<U>(callbackFn: (node: HtmlNode, index: number) => U): U[] | null {
        if (this.nodes === null)
            return null;
        return this.nodes.map(node => new HtmlNode(node)).map(callbackFn);
    }

    public compactMap<U>(callbackFn: (node: HtmlNode, index: number) => U | null | undefined): U[] | null {
        if (this.nodes === null)
            return null;
        return this.nodes.map(node => new HtmlNode(node)).flatMap((node, index) => {
            const value = callbackFn(node, index);
            // eslint-disable-next-line no-undefined
            if (value === null || value === undefined)
                return [];
            return { wrapped: value };
        })
            .map(value => value.wrapped);
    }

    public forEach(callbackFn: (node: HtmlNode, index: number) => void): void {
        if (this.nodes === null)
            return;
        this.nodes.map(node => new HtmlNode(node)).forEach(callbackFn);
    }

    public at(index: number): HtmlNode {
        if (this.nodes === null)
            return new HtmlNode();
        return new HtmlNode(this.nodes[index]);
    }
}

export class HtmlValue {
    private readonly value: string | null;

    public constructor(value?: string | null) {
        this.value = value ?? null;
    }

    public toString(): string | null {
        if (this.value === null)
            return null;
        return this.value.trim();
    }

    public toNumber(): number | null {
        if (this.value === null)
            return null;
        const value = Number(this.value);
        return Number.isNaN(value) ? null : value;
    }

    public toInt(): number | null {
        if (this.value === null)
            return null;
        const value = Number.parseInt(this.value);
        return Number.isNaN(value) ? null : value;
    }

    public regexGroup(regex: RegExp, groupName: string): HtmlValue {
        if (this.value === null)
            return new HtmlValue(null);
        const match = regex.exec(this.value);
        if (match === null)
            return new HtmlValue(null);
        const groupList = match.groups;
        // eslint-disable-next-line no-undefined
        if (groupList === undefined || !(groupName in groupList))
            return new HtmlValue(null);
        return new HtmlValue(groupList[groupName]);
    }
}
