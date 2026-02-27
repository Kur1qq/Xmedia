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
    remove(id: number): Promise<{
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
