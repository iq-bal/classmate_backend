import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure static file serving
const staticMiddleware = express.static(path.join(__dirname, '../uploads'));

export default staticMiddleware;