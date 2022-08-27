export class ParserBuffer {
    private readonly buffer: Uint8Array;

    private start: number = 0;
    private length: number = 0;

    constructor(length: number) {
        this.buffer = new Uint8Array(length);
    }

    write(byte: number) {
        if (this.length >= this.buffer.length) {
            // TODO(DakEnviy): Make error
            throw 'this.length >= this.buffer.length';
        }

        this.buffer[this.end] = byte;
        ++this.length;
    }

    flush(length?: number) {
        length = length ?? this.length;

        if (length > this.length) {
            // TODO(DakEnviy): Make error
            throw 'length > this.length';
        }

        const flushedBuffer = new Uint8Array(length);

        for (let i = 0; i < length; ++i) {
            flushedBuffer[i] = this.buffer[this.getAbsoluteIndex(i)];
        }

        this.start = (this.start + length) % this.buffer.length;
        this.length -= length;

        return flushedBuffer;
    }

    private get end() {
        return (this.start + this.length) % this.buffer.length;
    }

    private getAbsoluteIndex(index: number) {
        return (this.start + index) % this.buffer.length;
    }
}
