export declare class StorageService {
    private readonly logger;
    private readonly client;
    private readonly bucket;
    private readonly publicUrl;
    constructor();
    uploadFile(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    private extFromMime;
}
