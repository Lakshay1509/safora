import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

interface UploadOptions {
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
}

interface UploadResult {
  success: boolean;
  url: string;
  publicId: string;
}

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });
  }

  async uploadBuffer(buffer: Buffer, options: UploadOptions = {}): Promise<UploadApiResponse> {
  const { folder = 'Safe or Not', publicId, overwrite = true } = options;

  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder ,
        public_id: publicId,
        overwrite,
        resource_type: 'auto',
      },
      (error: UploadApiErrorResponse | undefined, result?: UploadApiResponse) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result returned from Cloudinary'));
        resolve(result);
      }
    ).end(buffer);
  });
}


  async uploadAvatar(buffer: Buffer, userId: string, folder = 'Safe or Not'): Promise<UploadResult> {
    try {
      const result = await this.uploadBuffer(buffer, {
        folder,
        publicId: `avatar_${userId}`,
        overwrite: true,
      });

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    }
  }

  async uploadPostImage(buffer: Buffer, userId: string, folder = 'Post Image'): Promise<UploadResult> {
    try {
      const result = await this.uploadBuffer(buffer, {
        folder,
        overwrite: true,
      });

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<any> {
    return await cloudinary.uploader.destroy(publicId);
  }
}

export default new CloudinaryService();
