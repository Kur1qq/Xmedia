import { StudioService } from './studio.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class StudioController {
    private readonly studioService;
    private readonly log;
    constructor(studioService: StudioService, log: AdminLogService);
    create(dto: any, req: any): Promise<{
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
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            studioId: number;
            hours: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
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
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            studioId: number;
            hours: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        isAvailable: boolean;
    })[]>;
    findOne(id: string): Promise<{
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
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            studioId: number;
            hours: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        isAvailable: boolean;
    }>;
    update(id: string, dto: any, req: any): Promise<{
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
        packages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            studioId: number;
            hours: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        isAvailable: boolean;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        address: string | null;
        sizeSqm: import("@prisma/client-runtime-utils").Decimal | null;
        capacity: number | null;
        isAvailable: boolean;
    }>;
}
