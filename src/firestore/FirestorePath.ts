export class FirestorePath {

    private readonly components: string[];

    public constructor(
        ...components: string[]
    ) {
        this.components = components;
    }

    public append(...components: string[]): void {
        for (const component of components) {
            if (component.includes('/'))
                throw new Error(`Invalid component: ${component}`);
            this.components.push(component);
        }
    }

    public appending(...components: string[]): FirestorePath {
        const path = new FirestorePath(...this.components);
        path.append(...components);
        return path;
    }

    public get isEmpty(): boolean {
        return this.components.length === 0;
    }

    public get parentPath(): FirestorePath {
        if (this.components.length === 0)
            throw new Error('Root path has no parent');
        return new FirestorePath(...this.components.slice(0, -1));
    }

    public get lastComponent(): string {
        return this.components[this.components.length - 1];
    }

    public get fullPath(): string {
        return this.components.join('/');
    }
}
