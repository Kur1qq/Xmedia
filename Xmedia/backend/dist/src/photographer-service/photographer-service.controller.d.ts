import { PhotographerServiceService } from './photographer-service.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class PhotographerServiceController {
    private readonly photographerServiceService;
    private readonly log;
    constructor(photographerServiceService: PhotographerServiceService, log: AdminLogService);
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
            photographerServiceId: number;
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
        equipments: ({
            equipment: {
                id: number;
                description: string | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: import("@prisma/client").$Enums.EquipmentType;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
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
        photographerSubTypeId: number | null;
    }>;
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
            photographerServiceId: number;
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
        equipments: ({
            equipment: {
                id: number;
                description: string | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: import("@prisma/client").$Enums.EquipmentType;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
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
        photographerSubTypeId: number | null;
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
            photographerServiceId: number;
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
        equipments: ({
            equipment: {
                id: number;
                description: string | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: import("@prisma/client").$Enums.EquipmentType;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
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
        photographerSubTypeId: number | null;
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
            photographerServiceId: number;
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
        equipments: ({
            equipment: {
                id: number;
                description: string | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: import("@prisma/client").$Enums.EquipmentType;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
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
        photographerSubTypeId: number | null;
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
        photographerSubTypeId: number | null;
    }>;
}
