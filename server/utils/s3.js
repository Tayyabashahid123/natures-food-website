// utils/s3.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

/**
 * uploadToS3(file)
 * - file: multer file object (has buffer, originalname, mimetype)
 * Returns: result from s3.upload().promise()
 */
async function uploadToS3(file) {
  const Key = `${Date.now()}-${uuidv4()}-${file.originalname.replace(/\s+/g,'_')}`;
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' // make object public (optional). Remove for private.
  };

  return s3.upload(params).promise(); // resolves to { Location, Key, ... }
}

module.exports = uploadToS3;
