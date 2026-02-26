export declare class UploadController {
    uploadFile(file: Express.Multer.File): {
        error: string;
        url?: undefined;
    } | {
        url: string;
        error?: undefined;
    };
}
