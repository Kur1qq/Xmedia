export declare class UploadController {
    uploadFile(file: Express.Multer.File, req: any): {
        error: string;
        url?: undefined;
    } | {
        url: string;
        error?: undefined;
    };
}
