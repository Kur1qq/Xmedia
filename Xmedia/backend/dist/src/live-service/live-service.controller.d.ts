import { LiveServiceService } from './live-service.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class LiveServiceController {
    private readonly liveServiceService;
    private readonly log;
    constructor(liveServiceService: LiveServiceService, log: AdminLogService);
    create(body: any, req: any): Promise<{
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        serviceType: {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        subType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            mainTypeId: number;
        } | null;
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            cameraCount: number;
            liveServiceId: number;
            label: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
        }[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        serviceTypeId: number | null;
        subTypeId: number | null;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
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
        serviceType: ({
            subTypes: {
                id: number;
                name: string;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                mainTypeId: number;
            }[];
        } & {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        }) | null;
        subType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            mainTypeId: number;
        } | null;
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            cameraCount: number;
            liveServiceId: number;
            label: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
        }[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        serviceTypeId: number | null;
        subTypeId: number | null;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
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
        serviceType: ({
            subTypes: {
                id: number;
                name: string;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                mainTypeId: number;
            }[];
        } & {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        }) | null;
        subType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            mainTypeId: number;
        } | null;
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            cameraCount: number;
            liveServiceId: number;
            label: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
        }[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        serviceTypeId: number | null;
        subTypeId: number | null;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
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
        serviceType: {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        subType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            mainTypeId: number;
        } | null;
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            cameraCount: number;
            liveServiceId: number;
            label: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
        }[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        serviceTypeId: number | null;
        subTypeId: number | null;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        categoryId: number;
        serviceTypeId: number | null;
        subTypeId: number | null;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
