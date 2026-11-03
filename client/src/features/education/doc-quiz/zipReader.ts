/**
 * Zero-dependency Browser ZIP Archive Reader
 * Uses Central Directory parsing and native DecompressionStream('deflate-raw')
 * to extract .docx (word/document.xml) and .pptx (ppt/slides/slide*.xml)
 */

export interface ZipEntry {
  filename: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  readText: () => Promise<string>;
  readBytes: () => Promise<Uint8Array>;
}

export class ZipReader {
  private view: DataView;
  private buffer: ArrayBuffer;
  private entries: Map<string, ZipEntry> = new Map();

  constructor(buffer: ArrayBuffer) {
    this.buffer = buffer;
    this.view = new DataView(buffer);
  }

  public async parse(): Promise<Map<string, ZipEntry>> {
    const eocdOffset = this.findEOCD();
    if (eocdOffset === -1) {
      throw new Error('Invalid ZIP archive: End of Central Directory record not found.');
    }

    const totalEntries = this.view.getUint16(eocdOffset + 10, true);
    const cdOffset = this.view.getUint32(eocdOffset + 16, true);

    let offset = cdOffset;
    const textDecoder = new TextDecoder();

    for (let i = 0; i < totalEntries && offset < this.buffer.byteLength; i++) {
      const signature = this.view.getUint32(offset, true);
      if (signature !== 0x02014b50) break; // PK\x01\x02

      const method = this.view.getUint16(offset + 10, true);
      const compressedSize = this.view.getUint32(offset + 20, true);
      const uncompressedSize = this.view.getUint32(offset + 24, true);
      const filenameLen = this.view.getUint16(offset + 28, true);
      const extraLen = this.view.getUint16(offset + 30, true);
      const commentLen = this.view.getUint16(offset + 32, true);
      const localHeaderOffset = this.view.getUint32(offset + 42, true);

      const filenameBytes = new Uint8Array(this.buffer, offset + 46, filenameLen);
      const filename = textDecoder.decode(filenameBytes);

      const entry: ZipEntry = {
        filename,
        compressedSize,
        uncompressedSize,
        compressionMethod: method,
        readBytes: async () => this.extractEntryBytes(localHeaderOffset, compressedSize, method),
        readText: async () => {
          const bytes = await this.extractEntryBytes(localHeaderOffset, compressedSize, method);
          return textDecoder.decode(bytes);
        },
      };

      this.entries.set(filename, entry);
      offset += 46 + filenameLen + extraLen + commentLen;
    }

    return this.entries;
  }

  private async extractEntryBytes(
    localHeaderOffset: number,
    compressedSize: number,
    method: number,
  ): Promise<Uint8Array> {
    const localSig = this.view.getUint32(localHeaderOffset, true);
    if (localSig !== 0x04034b50) {
      throw new Error(`Invalid local header signature at offset ${localHeaderOffset}`);
    }

    const localFilenameLen = this.view.getUint16(localHeaderOffset + 26, true);
    const localExtraLen = this.view.getUint16(localHeaderOffset + 28, true);
    const dataOffset = localHeaderOffset + 30 + localFilenameLen + localExtraLen;

    const slice = new Uint8Array(this.buffer, dataOffset, compressedSize);

    // Stored / uncompressed
    if (method === 0) {
      return slice;
    }

    // Deflate
    if (method === 8) {
      if (typeof DecompressionStream !== 'undefined') {
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        writer.write(slice);
        writer.close();
        const arrayBuf = await new Response(ds.readable).arrayBuffer();
        return new Uint8Array(arrayBuf);
      }
      throw new Error('DecompressionStream not supported in this environment');
    }

    throw new Error(`Unsupported compression method: ${method}`);
  }

  private findEOCD(): number {
    // Scan backwards from the end of the buffer for PK\x05\x06 (0x06054b50)
    const minOffset = Math.max(0, this.buffer.byteLength - 65557);
    for (let i = this.buffer.byteLength - 22; i >= minOffset; i--) {
      if (this.view.getUint32(i, true) === 0x06054b50) {
        return i;
      }
    }
    return -1;
  }
}
