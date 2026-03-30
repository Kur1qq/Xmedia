import { LiveServiceTypeService } from './live-service-type.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class LiveServiceTypeController {
    private readonly service;
    private readonly log;
    constructor(service: LiveServiceTypeService, log: AdminLogService);
    findAllMain(): Promise<({
        _count: {
            services: number;
        };
        subTypes: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
            mainTypeId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        sortOrder: number;
    })[]>;
    createMain(body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        sortOrder: number;
    }>;
    updateMain(id: string, body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        sortOrder: number;
    }>;
    removeMain(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        sortOrder: number;
    }>;
    findSub(mainTypeId: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
        mainTypeId: number;
    }[]>;
    createSub(body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
        mainTypeId: number;
    }>;
    updateSub(id: string, body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
        mainTypeId: number;
    }>;
    removeSub(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
        mainTypeId: number;
    }>;
}
