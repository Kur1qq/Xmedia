import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AdminService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(username: string, password: string): Promise<{
        token: string;
        admin: {
            id: number;
            username: string;
            image: string | null;
            role: import("@prisma/client").$Enums.AdminRole;
            customRoleId: number | null;
            customRole: {
                id: number;
                name: string;
                permissions: import("@prisma/client/runtime/client").JsonValue;
            } | null;
        };
    }>;
    findAll(): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        isActive: boolean;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        } | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        isActive: boolean;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        } | null;
    }>;
    create(data: {
        username: string;
        password: string;
        role?: string;
        image?: string;
        customRoleId?: number;
    }): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        isActive: boolean;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        } | null;
    }>;
    update(id: number, data: {
        username?: string;
        password?: string;
        role?: string;
        image?: string;
        isActive?: boolean;
        customRoleId?: number | null;
    }): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        isActive: boolean;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        } | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        updatedAt: Date;
        image: string | null;
        isActive: boolean;
        password: string;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
    }>;
    findAllRoles(): Promise<({
        _count: {
            admins: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    })[]>;
    findOneRole(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    createRole(data: {
        name: string;
        permissions: string[];
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    updateRole(id: number, data: {
        name?: string;
        permissions?: string[];
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    removeRole(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    seed(): Promise<void>;
}
