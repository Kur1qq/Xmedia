import { PrismaService } from '../prisma.service';
import { EquipmentType } from '@prisma/client';
export declare class EquipmentService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        description?: string;
        type?: EquipmentType;
        images?: string;
    }): Promise<{
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
    update(id: number, data: {
        name?: string;
        description?: string;
        type?: EquipmentType;
        images?: string;
    }): Promise<{
        id: number;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
    }>;
    remove(id: number): Promise<{
        id: number;
        description: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.EquipmentType;
    }>;
}
