import { LiveServiceService } from './live-service.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class LiveServiceController {
    private readonly liveServiceService;
    private readonly log;
    constructor(liveServiceService: LiveServiceService, log: AdminLogService);
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
            liveServiceId: number;
        })[];
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            cameraCount: number;
            label: string | null;
            liveServiceId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        categoryId: number;
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
            liveServiceId: number;
        })[];
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            cameraCount: number;
            label: string | null;
            liveServiceId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        categoryId: number;
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
            liveServiceId: number;
        })[];
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            cameraCount: number;
            label: string | null;
            liveServiceId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        categoryId: number;
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
            liveServiceId: number;
        })[];
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            cameraCount: number;
            label: string | null;
            liveServiceId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        categoryId: number;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        categoryId: number;
    }>;
}
