import type { IDatabaseScheme } from './IDatabaseScheme';

export abstract class IDatabaseSnapshot<Scheme extends IDatabaseScheme> {

    public abstract readonly hasChildren: boolean;

    public abstract readonly numberChildren: number;

    public abstract readonly key: string | null;

    public abstract readonly exists: boolean;

    public abstract readonly value: IDatabaseScheme.UncryptedValue<Scheme>;

    public abstract readonly uncryptedValue: IDatabaseScheme.CryptedValue<Scheme>;

    public abstract child<Key extends IDatabaseScheme.Key<Scheme>>(key: Key & string): IDatabaseSnapshot<IDatabaseScheme.Child<Scheme, Key>>;

    public abstract forEach(action: (snapshot: IDatabaseSnapshot<IDatabaseScheme.Children<Scheme>>) => boolean | void): boolean;

    public map<U>(transform: (snapshot: IDatabaseSnapshot<IDatabaseScheme.Children<Scheme>>) => U): U[] {
        const result: U[] = [];
        this.forEach(snapshot => {
            result.push(transform(snapshot));
        });
        return result;
    }

    public flatMap<U>(transform: (snapshot: IDatabaseSnapshot<IDatabaseScheme.Children<Scheme>>) => U[]): U[] {
        const result: U[] = [];
        this.forEach(snapshot => {
            result.push(...transform(snapshot));
        });
        return result;

    }

    public compactMap<U>(transform: (snapshot: IDatabaseSnapshot<IDatabaseScheme.Children<Scheme>>) => U | null | undefined): U[] {
        const result: U[] = [];
        this.forEach(snapshot => {
            const value = transform(snapshot);
            if (value !== undefined && value !== null)
                result.push(value);
        });
        return result;
    }

    public reduce<T>(initialValue: T, transform: (value: T, snapshot: IDatabaseSnapshot<IDatabaseScheme.Children<Scheme>>) => T): T {
        this.forEach(snapshot => {
            // eslint-disable-next-line no-param-reassign
            initialValue = transform(initialValue, snapshot);
        });
        return initialValue;
    }

    public reduceInto<T>(initialValue: T, transform: (value: T, snapshot: IDatabaseSnapshot<IDatabaseScheme.Children<Scheme>>) => void): T {
        this.forEach(snapshot => {
            transform(initialValue, snapshot);
        });
        return initialValue;
    }
}
