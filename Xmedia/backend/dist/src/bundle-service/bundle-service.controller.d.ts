import { BundleServiceService } from './bundle-service.service';
export declare class BundleServiceController {
    private readonly bundleServiceService;
    constructor(bundleServiceService: BundleServiceService);
    findAll(): Promise<({
        equipments: ({
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
        price: import("@prisma/client/runtime/library").Decimal;
        image: string | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
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
                images: import("@prisma/client/runtime/library").JsonValue | null;
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
        price: import("@prisma/client/runtime/library").Decimal;
        image: string | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
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
        price: import("@prisma/client/runtime/library").Decimal;
        image: string | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
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
                images: import("@prisma/client/runtime/library").JsonValue | null;
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
        price: import("@prisma/client/runtime/library").Decimal;
        image: string | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        image: string | null;
        includedServices: import("@prisma/client/runtime/library").JsonValue | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
    }>;
}
