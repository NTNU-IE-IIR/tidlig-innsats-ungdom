import { env } from '@/env.mjs';
import { Client } from 'minio';

const minioClient = new Client({
  endPoint: env.S3_ENDPOINT,
  port: 9000,
  useSSL: false,
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_ACCESS_KEY,
});

/**
 * A S3 client instance, using the minio client.
 * The minio client should be compatible with any S3-compatible storage provider.
 */
export const s3 = minioClient;
