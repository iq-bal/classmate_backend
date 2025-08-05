import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Uploads a file to local storage
 * @param {Object} file - The file object containing stream and metadata
 * @returns {Promise<Object>} Object containing the file URL
 */

export const uploadToLocal = async (file) => {
    try {
        const name = file.name;
        const mimeType = file.mimetype || 'application/octet-stream';

        // Log for debugging
        console.log('File MIME type:', mimeType);
        console.log('File data type:', typeof file.buffer !== 'undefined' ? 'buffer' : typeof file.stream !== 'undefined' ? 'stream' : 'unknown');

        // Generate a unique filename to avoid conflicts
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${name}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        // Handle both stream and buffer data
        if (file.stream) {
            // Original stream handling for multipart uploads
            const writeStream = fs.createWriteStream(filePath);
            await new Promise((resolve, reject) => {
                file.stream
                    .pipe(writeStream)
                    .on('finish', resolve)
                    .on('error', reject);
            });
        } else if (file.buffer) {
            // Handle buffer data from Socket.IO
            const buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
            await fs.promises.writeFile(filePath, buffer);
        } else if (file.data) {
            // Handle data property as fallback
            const buffer = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data);
            await fs.promises.writeFile(filePath, buffer);
        } else {
            throw new Error('No file data provided (missing stream, buffer, or data)');
        }

        // Return the URL that can be used to access the file
        const fileUrl = `/uploads/${uniqueFilename}`;

        console.log('File URL:', fileUrl); 
        
        return { url: fileUrl };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
};


/**
 * Deletes a file from local storage
 * @param {string} fileUrl - The URL of the file to delete
 */
export const deleteFromLocal = async (fileUrl) => {
    try {
        if (!fileUrl) return;
        
        // Extract filename from URL
        const filename = fileUrl.split('/').pop();
        const filePath = path.join(uploadsDir, filename);
        
        // Check if file exists before attempting to delete
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file');
    }
};