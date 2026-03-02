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
    findOne(id: string): Promise<{
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
    update(id: string, dto: any, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
