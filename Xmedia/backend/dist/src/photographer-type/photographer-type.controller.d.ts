import { PhotographerTypeService } from './photographer-type.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class PhotographerTypeController {
    private readonly service;
    private readonly log;
    constructor(service: PhotographerTypeService, log: AdminLogService);
    findAllMain(): Promise<({
        _count: {
            services: number;
        };
        subTypes: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            mainTypeId: number;
        }[];
    } & {
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    })[]>;
    createMain(body: any, req: any): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
    updateMain(id: string, body: any, req: any): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
    removeMain(id: string, req: any): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
    findSub(mainTypeId: string): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        mainTypeId: number;
    }[]>;
    createSub(body: any, req: any): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        mainTypeId: number;
    }>;
    updateSub(id: string, body: any, req: any): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        mainTypeId: number;
    }>;
    removeSub(id: string, req: any): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        mainTypeId: number;
    }>;
}
