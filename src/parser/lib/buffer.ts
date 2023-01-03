import { ParserError } from './errors';

export class ParserBuffer {
    private readonly buffer: Uint8Array;

    private start: number = 0;
    private length: number = 0;

    constructor(length: number) {
        this.buffer = new Uint8Array(length);
    }

    write(byte: number) {
        if (this.length >= this.buffer.length) {
            throw new ParserError(`Buffer is overflow, max length: ${this.buffer.length}`);
        }

        this.buffer[(this.start + this.length) % this.buffer.length] = byte;
        ++this.length;
    }

    flush(length: number = this.length) {
        if (length > this.length) {
            throw new ParserError(`Cannot flush ${length} bytes, current length: ${this.length}`);
        }

        const flushedBuffer = new Uint8Array(length);

        for (let i = 0; i < length; ++i) {
            flushedBuffer[i] = this.buffer[(this.start + i) % this.buffer.length]!;
        }

        this.start = (this.start + length) % this.buffer.length;
        this.length -= length;

        return flushedBuffer;
    }
}
