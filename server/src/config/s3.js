import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

const config = {
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
};

if (process.env.S3_ENDPOINT) {
  config.endpoint = process.env.S3_ENDPOINT;
  config.forcePathStyle = true;
}

export const s3 = new S3Client(config);
export const BUCKET = process.env.S3_BUCKET_NAME;
