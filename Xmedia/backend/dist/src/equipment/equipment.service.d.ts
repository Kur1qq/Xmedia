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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.EquipmentType;
        images: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.EquipmentType;
        images: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.EquipmentType;
        images: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    update(id: number, data: {
        name?: string;
        description?: string;
        type?: EquipmentType;
        images?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.EquipmentType;
        images: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        type: import("@prisma/client").$Enums.EquipmentType;
        images: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
