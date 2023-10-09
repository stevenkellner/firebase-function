import type { HtmlDom } from './HtmlNode';

export interface IWebsiteFetcher {
    fetch(): Promise<HtmlDom>;
}
