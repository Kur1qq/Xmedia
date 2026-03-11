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
        description: string | null;
        type: import("@prisma/client").$Enums.EquipmentType;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.EquipmentType;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.EquipmentType;
        images: import("@prisma/client/runtime/library").JsonValue | null;
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
        description: string | null;
        type: import("@prisma/client").$Enums.EquipmentType;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: number, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.EquipmentType;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
