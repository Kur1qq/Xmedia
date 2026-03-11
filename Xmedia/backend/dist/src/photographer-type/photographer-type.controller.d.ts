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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            mainTypeId: number;
            sortOrder: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
    })[]>;
    createMain(body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
    }>;
    updateMain(id: string, body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
    }>;
    removeMain(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
    }>;
    findSub(mainTypeId: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        mainTypeId: number;
        sortOrder: number;
    }[]>;
    createSub(body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        mainTypeId: number;
        sortOrder: number;
    }>;
    updateSub(id: string, body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        mainTypeId: number;
        sortOrder: number;
    }>;
    removeSub(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        mainTypeId: number;
        sortOrder: number;
    }>;
}
