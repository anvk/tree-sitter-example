// Function that returns true if an element is not null or undefined
export function notEmpty<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

// Function that will remove single and double quotes within a string
export function stripQuotesInString(argText: string): string {
    return argText.replace(/['"]+/g, '');
}
