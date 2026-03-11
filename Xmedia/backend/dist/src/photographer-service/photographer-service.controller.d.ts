import { PhotographerServiceService } from './photographer-service.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class PhotographerServiceController {
    private readonly photographerServiceService;
    private readonly log;
    constructor(photographerServiceService: PhotographerServiceService, log: AdminLogService);
    create(body: any, req: any): Promise<{
        equipments: ({
            equipment: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            photographerServiceId: number;
        })[];
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            photographerServiceId: number;
            subTypeId: number;
            duration: number;
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
        sortOrder: number;
        photographerSubTypeId: number | null;
    }>;
    findAll(): Promise<({
        equipments: ({
            equipment: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            photographerServiceId: number;
        })[];
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            photographerServiceId: number;
            subTypeId: number;
            duration: number;
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
        sortOrder: number;
        photographerSubTypeId: number | null;
    })[]>;
    findOne(id: string): Promise<{
        equipments: ({
            equipment: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            photographerServiceId: number;
        })[];
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            photographerServiceId: number;
            subTypeId: number;
            duration: number;
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
        sortOrder: number;
        photographerSubTypeId: number | null;
    }>;
    update(id: string, body: any, req: any): Promise<{
        equipments: ({
            equipment: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            photographerServiceId: number;
        })[];
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            photographerServiceId: number;
            subTypeId: number;
            duration: number;
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
        sortOrder: number;
        photographerSubTypeId: number | null;
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
        sortOrder: number;
        photographerSubTypeId: number | null;
    }>;
}
