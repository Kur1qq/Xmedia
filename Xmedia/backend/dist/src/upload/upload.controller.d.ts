import { CloudinaryService } from './cloudinary.service';
export declare class UploadController {
    private readonly cloudinary;
    constructor(cloudinary: CloudinaryService);
    uploadFile(file: Express.Multer.File): Promise<{
        error: string;
        url?: undefined;
    } | {
        url: string;
        error?: undefined;
    }>;
}
