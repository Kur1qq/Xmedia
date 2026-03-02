import { PrismaService } from '../prisma.service';
export declare class LiveServiceService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: number): Promise<{
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
    create(data: any): Promise<{
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
    update(id: number, data: any): Promise<{
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
    remove(id: number): Promise<{
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
