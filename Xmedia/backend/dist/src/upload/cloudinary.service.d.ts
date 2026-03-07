import { UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    private readonly logger;
    constructor();
    uploadFile(file: Express.Multer.File): Promise<UploadApiResponse>;
}
