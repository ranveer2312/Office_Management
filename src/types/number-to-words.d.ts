// types/number-to-words.d.ts

// This declaration tells TypeScript that the 'number-to-words' module
// exports an object containing a 'toWords' function.
declare module 'number-to-words' {
    export function toWords(num: number): string;
    // You can add other functions (like toWordsOrdinal) if you use them.
}