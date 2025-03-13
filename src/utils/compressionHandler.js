import JSZip from 'jszip';

class CompressionHandler {
    static async decompressFile(file) {
        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            
            // Handle the decompressed contents
            const files = [];
            for (const [filename, content] of Object.entries(contents.files)) {
                if (!content.dir) {
                    const data = await content.async('blob');
                    files.push({
                        name: filename,
                        data: data
                    });
                }
            }
            
            return files;
        } catch (error) {
            console.error('Error decompressing file:', error);
            throw new Error(`Failed to decompress file: ${error.message}`);
        }
    }

    static isCompressedFile(file) {
        // Common compressed file extensions
        const compressedExtensions = ['.zip', '.rar', '.7z', '.gz', '.tar'];
        const fileName = file.name.toLowerCase();
        return compressedExtensions.some(ext => fileName.endsWith(ext));
    }
}

export default CompressionHandler;