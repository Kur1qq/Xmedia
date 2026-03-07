import { EquipmentService } from './equipment.service';
import { EquipmentType } from '@prisma/client';
import { AdminLogService } from '../admin/admin-log.service';
export declare class EquipmentController {
    private readonly equipmentService;
    private readonly log;
    constructor(equipmentService: EquipmentService, log: AdminLogService);
    create(createData: {
        name: string;
        description?: string;
        type?: EquipmentType;
        images?: string;
    }, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    update(id: number, updateData: {
        name?: string;
        description?: string;
        type?: EquipmentType;
        images?: string;
    }, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    remove(id: number, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
