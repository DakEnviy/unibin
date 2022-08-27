export class ParserBuffer {
    private readonly buffer: Uint8Array;

    private start: number = 0;
    private length: number = 0;

    constructor(length: number) {
        this.buffer = new Uint8Array(length);
    }

    read(index: number) {
        if (index >= this.length) {
            return undefined;
        }

        return this.buffer[(this.start + index) % this.buffer.length];
    }

    write(byte: number) {
        if (this.length >= this.buffer.length) {
            // TODO(DakEnviy): Make error
            throw 'this.length >= this.buffer.length';
        }

        this.buffer[this.end] = byte;
        ++this.length;
    }

    // TODO(DakEnviy): Optimize it
    flush(length?: number) {
        length = length ?? this.length;

        if (length > this.length) {
            // TODO(DakEnviy): Make error
            throw 'length > this.length';
        }

        const flushedBuffer = new Uint8Array(length);

        for (let i = 0; i < length; ++i) {
            // TODO(DakEnviy): Remove non-null assertion
            flushedBuffer[i] = this.read(i)!;
        }

        this.start = (this.start + length) % this.buffer.length;
        this.length -= length;

        return flushedBuffer;
    }

    private get end() {
        return (this.start + this.length) % this.buffer.length;
    }
}
