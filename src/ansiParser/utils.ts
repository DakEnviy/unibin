export const char = (char: string): number => {
    return char.charCodeAt(0);
};

export const isCharNumeric = (char: number): boolean => {
    return 48 <= char && char <= 57;
};
