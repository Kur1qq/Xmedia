import { PrismaService } from '../prisma.service';
export declare class PhotographerServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
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
            photographerServiceId: number;
            equipmentId: number;
        })[];
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
        image: string | null;
        isActive: boolean;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        photographerSubTypeId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
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
            photographerServiceId: number;
            equipmentId: number;
        })[];
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
        image: string | null;
        isActive: boolean;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        photographerSubTypeId: number | null;
    }>;
    create(data: any): Promise<{
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
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
            photographerServiceId: number;
            equipmentId: number;
        })[];
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
        image: string | null;
        isActive: boolean;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        photographerSubTypeId: number | null;
    }>;
    update(id: number, data: any): Promise<{
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                mainTypeId: number;
                sortOrder: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
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
            photographerServiceId: number;
            equipmentId: number;
        })[];
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
        image: string | null;
        isActive: boolean;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        photographerSubTypeId: number | null;
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
        mainTypeId: number;
        photographerSubTypeId: number | null;
    }>;
}
