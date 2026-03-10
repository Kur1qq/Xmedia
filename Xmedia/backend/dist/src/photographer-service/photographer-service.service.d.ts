import { PrismaService } from '../prisma.service';
export declare class PhotographerServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        mainType: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
        };
        packages: ({
            subType: {
                id: number;
                mainTypeId: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                price: import("@prisma/client-runtime-utils").Decimal | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            subTypeId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            duration: number;
            priceLabel: string | null;
        })[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        mainTypeId: number;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        photographerSubTypeId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        mainType: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
        };
        packages: ({
            subType: {
                id: number;
                mainTypeId: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                price: import("@prisma/client-runtime-utils").Decimal | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            subTypeId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            duration: number;
            priceLabel: string | null;
        })[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        mainTypeId: number;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        photographerSubTypeId: number | null;
    }>;
    create(data: any): Promise<{
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        mainType: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
        };
        packages: ({
            subType: {
                id: number;
                mainTypeId: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                price: import("@prisma/client-runtime-utils").Decimal | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            subTypeId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            duration: number;
            priceLabel: string | null;
        })[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        mainTypeId: number;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        photographerSubTypeId: number | null;
    }>;
    update(id: number, data: any): Promise<{
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        mainType: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
        };
        packages: ({
            subType: {
                id: number;
                mainTypeId: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                price: import("@prisma/client-runtime-utils").Decimal | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            subTypeId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            duration: number;
            priceLabel: string | null;
        })[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            photographerServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        mainTypeId: number;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        photographerSubTypeId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        categoryId: number;
        mainTypeId: number;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        photographerSubTypeId: number | null;
    }>;
}
