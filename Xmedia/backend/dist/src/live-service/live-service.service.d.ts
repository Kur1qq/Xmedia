import { PrismaService } from '../prisma.service';
export declare class LiveServiceService {
    private prisma;
    constructor(prisma: PrismaService);
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
                type: import("@prisma/client").$Enums.EquipmentType;
                description: string | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
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
            label: string | null;
            cameraCount: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
    })[]>;
    findOne(id: number): Promise<{
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
                type: import("@prisma/client").$Enums.EquipmentType;
                description: string | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
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
            label: string | null;
            cameraCount: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
    }>;
    create(data: any): Promise<{
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
                type: import("@prisma/client").$Enums.EquipmentType;
                description: string | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
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
            label: string | null;
            cameraCount: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
    }>;
    update(id: number, data: any): Promise<{
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
                type: import("@prisma/client").$Enums.EquipmentType;
                description: string | null;
                images: import("@prisma/client/runtime/client").JsonValue | null;
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
            label: string | null;
            cameraCount: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
    }>;
}
