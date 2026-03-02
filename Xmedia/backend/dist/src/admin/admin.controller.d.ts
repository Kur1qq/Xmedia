import { AdminService } from './admin.service';
import { AdminLogService } from './admin-log.service';
export declare class AdminController {
    private readonly adminService;
    private readonly logService;
    constructor(adminService: AdminService, logService: AdminLogService);
    login(body: {
        username: string;
        password: string;
    }, req: any): Promise<{
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
    getLogs(adminId?: string, limit?: string, offset?: string): Promise<({
        admin: {
            id: number;
            username: string;
            image: string | null;
            role: import("@prisma/client").$Enums.AdminRole;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        action: string;
        entity: string | null;
        entityId: number | null;
        detail: string | null;
        ip: string | null;
        adminId: number | null;
    })[]>;
    getRoles(): Promise<({
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
    createRole(body: {
        name: string;
        permissions: string[];
    }, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    updateRole(id: string, body: {
        name?: string;
        permissions?: string[];
    }, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    removeRole(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        username: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        isActive: boolean;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        } | null;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        createdAt: Date;
        username: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        isActive: boolean;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        } | null;
    }>;
    create(body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        username: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        isActive: boolean;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        } | null;
    }>;
    update(id: string, body: any, req: any): Promise<{
        id: number;
        createdAt: Date;
        username: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        isActive: boolean;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        } | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        username: string;
        password: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        isActive: boolean;
    }>;
}
