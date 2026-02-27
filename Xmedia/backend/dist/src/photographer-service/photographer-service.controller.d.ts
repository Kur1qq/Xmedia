import { PhotographerServiceService } from './photographer-service.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class PhotographerServiceController {
    private readonly photographerServiceService;
    private readonly log;
    constructor(photographerServiceService: PhotographerServiceService, log: AdminLogService);
    create(body: any, req: any): Promise<{
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        equipments: ({
            equipment: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            photographerServiceId: number;
        })[];
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
        image: string | null;
        isActive: boolean;
        description: string | null;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal | null;
        dailyRate: import("@prisma/client-runtime-utils").Decimal | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    findAll(): Promise<({
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        equipments: ({
            equipment: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            photographerServiceId: number;
        })[];
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
        image: string | null;
        isActive: boolean;
        description: string | null;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal | null;
        dailyRate: import("@prisma/client-runtime-utils").Decimal | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        equipments: ({
            equipment: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            photographerServiceId: number;
        })[];
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
        image: string | null;
        isActive: boolean;
        description: string | null;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal | null;
        dailyRate: import("@prisma/client-runtime-utils").Decimal | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    update(id: string, body: any, req: any): Promise<{
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        equipments: ({
            equipment: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            photographerServiceId: number;
        })[];
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
        image: string | null;
        isActive: boolean;
        description: string | null;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal | null;
        dailyRate: import("@prisma/client-runtime-utils").Decimal | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal | null;
        dailyRate: import("@prisma/client-runtime-utils").Decimal | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
}
