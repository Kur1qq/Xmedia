import { EditTypeService } from './edit-type.service';
import { EditServiceService } from './edit-service.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class EditTypeController {
    private readonly editTypeService;
    private readonly log;
    constructor(editTypeService: EditTypeService, log: AdminLogService);
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
    createSub(body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        mainTypeId: number;
        sortOrder: number;
    }>;
    updateSub(id: string, body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        mainTypeId: number;
        sortOrder: number;
    }>;
    removeSub(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        mainTypeId: number;
        sortOrder: number;
    }>;
}
export declare class EditServiceController {
    private readonly editServiceService;
    private readonly log;
    constructor(editServiceService: EditServiceService, log: AdminLogService);
    findAll(): Promise<({
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            editServiceId: number;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            mainTypeId: number;
            sortOrder: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    })[]>;
    findOne(id: string): Promise<{
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            editServiceId: number;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            mainTypeId: number;
            sortOrder: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    create(body: any, req: any): Promise<{
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            editServiceId: number;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            mainTypeId: number;
            sortOrder: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    update(id: string, body: any, req: any): Promise<{
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            editServiceId: number;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            mainTypeId: number;
            sortOrder: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
}
