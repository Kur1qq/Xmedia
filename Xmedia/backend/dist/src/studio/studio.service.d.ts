import { PrismaService } from '../prisma.service';
export declare class StudioService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        equipment: ({
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
            studioId: number;
            equipmentId: number;
        })[];
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            studioId: number;
            hours: number;
            price: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        id: number;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isAvailable: boolean;
    }>;
    findAll(): Promise<({
        equipment: ({
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
            studioId: number;
            equipmentId: number;
        })[];
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            studioId: number;
            hours: number;
            price: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        id: number;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isAvailable: boolean;
    })[]>;
    findOne(id: number): Promise<{
        equipment: ({
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
            studioId: number;
            equipmentId: number;
        })[];
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            studioId: number;
            hours: number;
            price: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        id: number;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isAvailable: boolean;
    }>;
    update(id: number, data: any): Promise<{
        equipment: ({
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
            studioId: number;
            equipmentId: number;
        })[];
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            studioId: number;
            hours: number;
            price: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        id: number;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isAvailable: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isAvailable: boolean;
    }>;
}
