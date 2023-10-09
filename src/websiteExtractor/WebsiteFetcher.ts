import DOMParser from 'dom-parser';
import { HtmlDom } from './HtmlNode';
import type { IWebsiteFetcher } from './IWebsiteFetcher';
import fetch from 'cross-fetch';

export class WebsiteFetcher implements IWebsiteFetcher {
    public constructor(
        private readonly url: string
    ) {}

    public async fetch(): Promise<HtmlDom> {
        const data = await fetch(this.url);
        const html = await data.text();
        const dom = new DOMParser().parseFromString(html);
        return new HtmlDom(dom);
    }
}
