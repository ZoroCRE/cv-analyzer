import { supabaseAdmin } from '../utils/supabaseClient';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

const BUCKET_NAME = process.env.STORAGE_BUCKET || 'cv-uploads';

/**
 * Downloads a file from Supabase Storage to a temporary local path.
 * @param storagePath The path of the file in the Supabase bucket.
 * @returns The local path to the downloaded temporary file.
 */
export async function downloadFile(storagePath: string): Promise<string> {
  logger.info(`Downloading file from storage: ${storagePath}`);
  
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .download(storagePath);

  if (error || !data) {
    logger.error(`Failed to download file from ${storagePath}`, error);
    throw new ApiError(500, `Could not download file from storage: ${error?.message}`);
  }

  const tempDir = os.tmpdir();
  const localPath = path.join(tempDir, path.basename(storagePath));
  
  const buffer = Buffer.from(await data.arrayBuffer());
  await fs.writeFile(localPath, buffer);

  logger.info(`File downloaded successfully to temporary path: ${localPath}`);
  return localPath;
}

/**
 * Deletes a temporary local file.
 * @param localPath The path to the local file to delete.
 */
export async function cleanupTempFile(localPath: string): Promise<void> {
  try {
    await fs.unlink(localPath);
    logger.info(`Cleaned up temporary file: ${localPath}`);
  } catch (err) {
    logger.warn(`Failed to clean up temporary file ${localPath}`, err);
  }
}