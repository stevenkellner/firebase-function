/**
 * Build a string from multiple substrings.
 */
export class StringBuilder {
    /**
     * List of all substrings.
     */
    private readonly stringArray: string[] = [];

    /**
     * Append a new substring to the string builder.
     * @param { string } string Substring to append to the string builder.
     */
    public append(string: string) {
        this.stringArray.push(string);
    }

    /**
     * Append a new sting with a new line feed to the string builder.
     * @param { string } string Substring to append with a new line feed to the string builder.
     */
    public appendLine(string: string) {
        this.stringArray.push(`${string}\n`);
    }

    /**
     * Joins all substring to the result string.
     * @return { string } Result string of the string builder,
     */
    public toString(): string {
        return this.stringArray.join('');
    }
}
