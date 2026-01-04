import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
}

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
  private readonly allowedVideoTypes = ['video/mp4', 'video/quicktime'];

  constructor(private configService: ConfigService) {
    const storageType = this.configService.get<string>('STORAGE_TYPE') || 'local';
    const storagePath = this.configService.get<string>('STORAGE_PATH') || './uploads';

    if (storageType === 'local') {
      this.uploadDir = path.join(process.cwd(), storagePath);
      // Ensure upload directories exist
      this.ensureDirectoryExists(this.uploadDir);
      this.ensureDirectoryExists(path.join(this.uploadDir, 'signatures'));
      this.ensureDirectoryExists(path.join(this.uploadDir, 'photos'));
      this.ensureDirectoryExists(path.join(this.uploadDir, 'videos'));
    } else {
      // For S3 or other cloud storage, we'll handle differently
      this.uploadDir = storagePath;
    }
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    category: 'signature' | 'photo' | 'video',
    willId?: string,
  ): Promise<UploadResult> {
    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Validate file type
    if (category === 'signature' || category === 'photo') {
      if (!this.allowedImageTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type. Allowed types: ${this.allowedImageTypes.join(', ')}`,
        );
      }
    } else if (category === 'video') {
      if (!this.allowedVideoTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type. Allowed types: ${this.allowedVideoTypes.join(', ')}`,
        );
      }
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;

    // Determine upload path
    let uploadPath: string;
    let urlPath: string;

    if (willId) {
      const willDir = path.join(this.uploadDir, category, willId);
      this.ensureDirectoryExists(willDir);
      uploadPath = path.join(willDir, uniqueFilename);
      urlPath = `/uploads/${category}/${willId}/${uniqueFilename}`;
    } else {
      uploadPath = path.join(this.uploadDir, category, uniqueFilename);
      urlPath = `/uploads/${category}/${uniqueFilename}`;
    }

    // Save file
    fs.writeFileSync(uploadPath, file.buffer);

    return {
      filename: uniqueFilename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: urlPath,
      path: uploadPath,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }

  async deleteFileByUrl(url: string): Promise<void> {
    // Convert URL to file path
    const relativePath = url.replace('/uploads/', '');
    const filePath = path.join(this.uploadDir, relativePath);
    await this.deleteFile(filePath);
  }
}
