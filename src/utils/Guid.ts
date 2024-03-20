import { v4 as generateUUID } from 'uuid';

export class Guid {

    public constructor(
        public readonly guidString: string
    ) {}

    public static from(value: string): Guid {
        const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/u;
        if (!regex.test(value))
            throw new Error('Could not parse Guid, guid string is invalid.');
        return new Guid(value.toLowerCase());
    }

    public static generate(): Guid {
        return new Guid(generateUUID());
    }
}
