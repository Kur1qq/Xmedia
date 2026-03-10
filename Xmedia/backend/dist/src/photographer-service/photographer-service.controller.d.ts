import { PhotographerServiceService } from './photographer-service.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class PhotographerServiceController {
    private readonly photographerServiceService;
    private readonly log;
    constructor(photographerServiceService: PhotographerServiceService, log: AdminLogService);
    create(body: any, req: any): Promise<{
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        mainType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        };
        packages: ({
            subType: {
                id: number;
                mainTypeId: number;
                name: string;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                price: import("@prisma/client-runtime-utils").Decimal | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            subTypeId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            duration: number;
            priceLabel: string | null;
        })[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        mainTypeId: number;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        photographerSubTypeId: number | null;
    }>;
    findAll(): Promise<({
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        mainType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        };
        packages: ({
            subType: {
                id: number;
                mainTypeId: number;
                name: string;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                price: import("@prisma/client-runtime-utils").Decimal | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            subTypeId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            duration: number;
            priceLabel: string | null;
        })[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        mainTypeId: number;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        photographerSubTypeId: number | null;
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        mainType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        };
        packages: ({
            subType: {
                id: number;
                mainTypeId: number;
                name: string;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                price: import("@prisma/client-runtime-utils").Decimal | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            subTypeId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            duration: number;
            priceLabel: string | null;
        })[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        mainTypeId: number;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        photographerSubTypeId: number | null;
    }>;
    update(id: string, body: any, req: any): Promise<{
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        mainType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        };
        packages: ({
            subType: {
                id: number;
                mainTypeId: number;
                name: string;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                price: import("@prisma/client-runtime-utils").Decimal | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            subTypeId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            duration: number;
            priceLabel: string | null;
        })[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        mainTypeId: number;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        photographerSubTypeId: number | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        categoryId: number;
        mainTypeId: number;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        photographerSubTypeId: number | null;
    }>;
}
