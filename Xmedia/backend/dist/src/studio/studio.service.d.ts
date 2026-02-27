import { PrismaService } from '../prisma.service';
export declare class StudioService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        equipment: ({
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
            studioId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal;
        dailyRate: import("@prisma/client-runtime-utils").Decimal | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isAvailable: boolean;
    }>;
    findAll(): Promise<({
        equipment: ({
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
            studioId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal;
        dailyRate: import("@prisma/client-runtime-utils").Decimal | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isAvailable: boolean;
    })[]>;
    findOne(id: number): Promise<{
        equipment: ({
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
            studioId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal;
        dailyRate: import("@prisma/client-runtime-utils").Decimal | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isAvailable: boolean;
    }>;
    update(id: number, data: any): Promise<{
        equipment: ({
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
            studioId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal;
        dailyRate: import("@prisma/client-runtime-utils").Decimal | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isAvailable: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal;
        dailyRate: import("@prisma/client-runtime-utils").Decimal | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isAvailable: boolean;
    }>;
}
