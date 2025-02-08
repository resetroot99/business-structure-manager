const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();

const uploadToS3 = async (file, businessId) => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const key = `documents/${businessId}/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private'
    };

    const result = await s3.upload(params).promise();
    
    return {
      key: result.Key,
      url: result.Location
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

const getSignedUrl = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 3600 // URL expires in 1 hour
    };

    return await s3.getSignedUrlPromise('getObject', params);
  } catch (error) {
    console.error('S3 SignedUrl Error:', error);
    throw new Error('Failed to generate signed URL');
  }
};

module.exports = {
  uploadToS3,
  getSignedUrl
}; 