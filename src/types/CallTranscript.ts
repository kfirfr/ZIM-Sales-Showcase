export interface TranscriptLine {
    start: number;
    end: number;
    speaker: 'agent' | 'user';
    text: string;
    words: { text: string; start: number; end: number }[];
}
