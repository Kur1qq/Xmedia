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
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
    }>;
    findAll(): Promise<{
        id: number;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
    }>;
    update(id: number, updateData: {
        name?: string;
        description?: string;
        type?: EquipmentType;
        images?: string;
    }, req: any): Promise<{
        id: number;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
    }>;
    remove(id: number, req: any): Promise<{
        id: number;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
    }>;
}
