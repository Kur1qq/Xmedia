import { PrismaService } from '../prisma.service';
export declare class PhotographerServiceService {
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
    remove(id: number): Promise<{
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
