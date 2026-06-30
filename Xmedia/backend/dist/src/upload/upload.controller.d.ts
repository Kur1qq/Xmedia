import { StorageService } from './storage.service';
export declare class UploadController {
    private readonly storage;
    constructor(storage: StorageService);
    uploadFile(file: Express.Multer.File): Promise<{
        error: string;
        url?: undefined;
    } | {
        url: string;
        error?: undefined;
    }>;
}
