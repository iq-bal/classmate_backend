import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = {
    "type": "service_account",
    "project_id": "classmate-4904f",
    "private_key_id": "939a2ca64ed2cbb697bde63cfdb1caade25ad44c",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC+8Z6OE+IR5Us9\ncxsmBMD7Zt7Mgun16iaSTlrUsFCjw2pMGGAstWO4e1AZlpowE5nk/sl4CiKMuxgv\njd7e6F3cZvYSe4MR6XT86NDRDMYIu+icf+AKYNubg1B0JDMcm98Ac64geTkAFx2F\nqJVeL7q+cJE7KFrZwAZ08mpiNkMFHEGDcSzFgCIjnwQi9Fm76iXVQ...",
    "client_email": "firebase-adminsdk-fbsvc@classmate-4904f.iam.gserviceaccount.com",
    "client_id": "102874340708890702061",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40classmate-4904f.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'classmate-4904f.firebasestorage.app'
  });
}

const bucket = getStorage().bucket();

/**
 * Upload a file to Firebase Storage
 * @param {Object} file - File object with buffer, name, type, etc.
 * @returns {Promise<Object>} Object containing the download URL
 */
export const uploadToFirebase = async (file) => {
  try {
    const fileName = `chat-files/${uuidv4()}-${file.name}`;
    const fileBuffer = Buffer.from(file.buffer || file.data);
    
    const fileUpload = bucket.file(fileName);
    
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.type || file.mimetype || 'application/octet-stream',
      },
    });

    // Make the file publicly accessible
    await fileUpload.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return {
      url: publicUrl,
      fileName: file.name,
      size: file.size,
      type: file.type || file.mimetype
    };
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw new Error(`Failed to upload file to Firebase: ${error.message}`);
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} fileUrl - The public URL of the file to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteFromFirebase = async (fileUrl) => {
  try {
    if (!fileUrl) return true;
    
    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const bucketName = urlParts[3];
    const filePath = urlParts.slice(4).join('/');
    
    if (bucketName !== bucket.name) {
      console.warn('File URL does not match current bucket');
      return false;
    }

    const file = bucket.file(filePath);
    
    // Check if file exists before attempting to delete
    const [exists] = await file.exists();
    if (!exists) {
      console.warn('File does not exist:', filePath);
      return true; // Consider it successful if file doesn't exist
    }

    await file.delete();
    console.log('File deleted successfully:', filePath);
    return true;
  } catch (error) {
    console.error('Error deleting from Firebase:', error);
    throw new Error(`Failed to delete file from Firebase: ${error.message}`);
  }
};

/**
 * Generate a thumbnail for images/videos (placeholder implementation)
 * @param {string} fileUrl - The URL of the original file
 * @returns {Promise<string>} URL of the thumbnail
 */
export const generateThumbnail = async (fileUrl) => {
  try {
    // This is a placeholder implementation
    // In a real application, you would use image processing libraries
    // like Sharp, ImageMagick, or cloud functions to generate thumbnails
    
    // For now, return the original URL as thumbnail
    // You can implement actual thumbnail generation based on your needs
    return fileUrl;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return fileUrl; // Fallback to original URL
  }
};

/**
 * Upload multiple files to Firebase Storage
 * @param {Array} files - Array of file objects
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleToFirebase = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadToFirebase(file));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error(`Failed to upload multiple files: ${error.message}`);
  }
};

/**
 * Get file metadata from Firebase Storage
 * @param {string} fileUrl - The public URL of the file
 * @returns {Promise<Object>} File metadata
 */
export const getFileMetadata = async (fileUrl) => {
  try {
    const urlParts = fileUrl.split('/');
    const filePath = urlParts.slice(4).join('/');
    
    const file = bucket.file(filePath);
    const [metadata] = await file.getMetadata();
    
    return {
      name: metadata.name,
      size: metadata.size,
      contentType: metadata.contentType,
      timeCreated: metadata.timeCreated,
      updated: metadata.updated
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }
};