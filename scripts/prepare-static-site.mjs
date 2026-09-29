import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const outputDirectory = path.resolve('out');
await mkdir(outputDirectory, { recursive: true });

// The original portfolio is a self-contained static document in public.
// Copy it last so it remains the deployed site entry point after Next exports.
await copyFile(path.resolve('public/index.html'), path.join(outputDirectory, 'index.html'));
