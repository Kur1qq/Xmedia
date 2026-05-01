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
    findOne(id: string): Promise<{
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
    update(id: string, dto: any, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
