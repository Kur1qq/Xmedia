import { PrismaService } from '../prisma.service';
export declare class LiveServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
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
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            liveServiceId: number;
            label: string | null;
            cameraCount: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        categoryId: number;
    })[]>;
    findOne(id: number): Promise<{
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
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            liveServiceId: number;
            label: string | null;
            cameraCount: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        categoryId: number;
    }>;
    create(data: any): Promise<{
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
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            liveServiceId: number;
            label: string | null;
            cameraCount: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        categoryId: number;
    }>;
    update(id: number, data: any): Promise<{
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
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            liveServiceId: number;
            label: string | null;
            cameraCount: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        categoryId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        categoryId: number;
    }>;
}
