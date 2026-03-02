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
export declare class EditServiceController {
    private readonly editServiceService;
    private readonly log;
    constructor(editServiceService: EditServiceService, log: AdminLogService);
    findAll(): Promise<({
        packages: ({
            subType: {
                id: number;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            editServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        subType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            mainTypeId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    })[]>;
    findOne(id: string): Promise<{
        packages: ({
            subType: {
                id: number;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            editServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        subType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            mainTypeId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    create(body: any, req: any): Promise<{
        packages: ({
            subType: {
                id: number;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            editServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        subType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            mainTypeId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    update(id: string, body: any, req: any): Promise<{
        packages: ({
            subType: {
                id: number;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            editServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        subType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            mainTypeId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
}
