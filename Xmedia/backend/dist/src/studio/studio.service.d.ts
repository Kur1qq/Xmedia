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
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            studioId: number;
        })[];
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            studioId: number;
            hours: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client/runtime/library").Decimal | null;
        capacity: number | null;
        isAvailable: boolean;
        extraHourPrice: import("@prisma/client/runtime/library").Decimal | null;
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
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            studioId: number;
        })[];
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            studioId: number;
            hours: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client/runtime/library").Decimal | null;
        capacity: number | null;
        isAvailable: boolean;
        extraHourPrice: import("@prisma/client/runtime/library").Decimal | null;
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
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            studioId: number;
        })[];
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            studioId: number;
            hours: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client/runtime/library").Decimal | null;
        capacity: number | null;
        isAvailable: boolean;
        extraHourPrice: import("@prisma/client/runtime/library").Decimal | null;
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
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipmentId: number;
            studioId: number;
        })[];
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            studioId: number;
            hours: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client/runtime/library").Decimal | null;
        capacity: number | null;
        isAvailable: boolean;
        extraHourPrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client/runtime/library").Decimal | null;
        capacity: number | null;
        isAvailable: boolean;
        extraHourPrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
