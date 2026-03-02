import { LiveServiceService } from './live-service.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class LiveServiceController {
    private readonly liveServiceService;
    private readonly log;
    constructor(liveServiceService: LiveServiceService, log: AdminLogService);
    create(body: any, req: any): Promise<{
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
            liveServiceId: number;
            equipmentId: number;
        })[];
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            cameraCount: number;
            label: string | null;
        }[];
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
    }>;
    findAll(): Promise<({
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
            liveServiceId: number;
            equipmentId: number;
        })[];
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            cameraCount: number;
            label: string | null;
        }[];
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
    })[]>;
    findOne(id: string): Promise<{
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
            liveServiceId: number;
            equipmentId: number;
        })[];
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            cameraCount: number;
            label: string | null;
        }[];
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
    }>;
    update(id: string, body: any, req: any): Promise<{
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
            liveServiceId: number;
            equipmentId: number;
        })[];
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            cameraCount: number;
            label: string | null;
        }[];
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
    }>;
}
