import { PrismaService } from '../prisma.service';
export declare class BundleServiceService {
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
            quantity: number;
            equipmentId: number;
            bundleServiceId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        image: string | null;
        includedServices: import("@prisma/client/runtime/client").JsonValue | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
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
            quantity: number;
            equipmentId: number;
            bundleServiceId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        image: string | null;
        includedServices: import("@prisma/client/runtime/client").JsonValue | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
    }>;
    create(data: any): Promise<{
        equipments: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            equipmentId: number;
            bundleServiceId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        image: string | null;
        includedServices: import("@prisma/client/runtime/client").JsonValue | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
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
            quantity: number;
            equipmentId: number;
            bundleServiceId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        image: string | null;
        includedServices: import("@prisma/client/runtime/client").JsonValue | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        image: string | null;
        includedServices: import("@prisma/client/runtime/client").JsonValue | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        isActive: boolean;
    }>;
}
