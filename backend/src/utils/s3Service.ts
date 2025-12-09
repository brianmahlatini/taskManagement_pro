import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

interface S3Config {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
}

class S3Service {
    private s3Client: S3Client | null;
    private config: S3Config;

    constructor() {
        this.config = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            region: process.env.AWS_REGION || 'us-east-1',
            bucketName: process.env.AWS_S3_BUCKET_NAME || 'taskflow-attachments'
        };

        // Check if S3 is configured
        const isS3Configured = this.config.accessKeyId && this.config.secretAccessKey && this.config.bucketName;

        if (isS3Configured) {
            this.s3Client = new S3Client({
                region: this.config.region,
                credentials: {
                    accessKeyId: this.config.accessKeyId,
                    secretAccessKey: this.config.secretAccessKey,
                },
            });
        } else {
            console.log('S3 not configured, using local storage fallback');
            this.s3Client = null;
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
        if (!this.s3Client) {
            // Fallback to local storage if S3 is not configured
            return this.localStorageFallback(file);
        }

        const fileExtension = file.originalname.split('.').pop();
        const fileKey = `uploads/${uuidv4()}.${fileExtension}`;

        const params = {
            Bucket: this.config.bucketName,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        try {
            await this.s3Client.send(new PutObjectCommand(params));

            // Generate a signed URL for the uploaded file
            const signedUrl = await this.generateSignedUrl(fileKey);

            return {
                url: signedUrl,
                key: fileKey,
            };
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            throw new Error('Failed to upload file to S3');
        }
    }

    private async localStorageFallback(file: Express.Multer.File): Promise<{ url: string; key: string }> {
        // Implement local storage fallback
        const fs = await import('fs');
        const path = await import('path');

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileExtension = file.originalname.split('.').pop();
        const fileKey = `file-${Date.now()}.${fileExtension}`;
        const filePath = path.join(uploadDir, fileKey);

        // Write file to local storage
        fs.writeFileSync(filePath, file.buffer);

        // Return local URL
        return {
            url: `/uploads/${fileKey}`,
            key: fileKey,
        };
    }

    async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        if (!this.s3Client) {
            throw new Error('S3 client not initialized');
        }

        const command = new GetObjectCommand({
            Bucket: this.config.bucketName,
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }

    async deleteFile(key: string): Promise<void> {
        if (!this.s3Client) {
            // Local storage fallback for deletion
            try {
                const fs = await import('fs');
                const path = await import('path');
                const filePath = path.join(process.cwd(), 'uploads', key);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return;
            } catch (error) {
                console.error('Error deleting local file:', error);
                throw new Error('Failed to delete local file');
            }
        }

        const params = {
            Bucket: this.config.bucketName,
            Key: key,
        };

        try {
            await this.s3Client.send(new DeleteObjectCommand(params));
        } catch (error) {
            console.error('Error deleting file from S3:', error);
            throw new Error('Failed to delete file from S3');
        }
    }

    async getFileUrl(key: string): Promise<string> {
        try {
            return this.generateSignedUrl(key);
        } catch (error) {
            console.error('Error generating file URL:', error);
            throw new Error('Failed to generate file URL');
        }
    }
}

export const s3Service = new S3Service();