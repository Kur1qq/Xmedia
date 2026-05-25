import { AdminService } from './admin.service';
import { AdminLogService } from './admin-log.service';
import { AdminNotificationService } from './admin-notification.service';
export declare class AdminController {
    private readonly adminService;
    private readonly adminLogService;
    private readonly adminNotificationService;
    constructor(adminService: AdminService, adminLogService: AdminLogService, adminNotificationService: AdminNotificationService);
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
                permissions: import("@prisma/client/runtime/library").JsonValue;
            } | null;
        };
    }>;
    getLogs(page: number, limit: number, adminId?: string, action?: string, startDate?: string, endDate?: string): Promise<({
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
    getNotifications(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        type: string;
        isRead: boolean;
        referenceId: number | null;
    }[]>;
    markAllNotificationsAsRead(): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markNotificationAsRead(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        type: string;
        isRead: boolean;
        referenceId: number | null;
    }>;
    getRoles(): Promise<({
        _count: {
            admins: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    createRole(body: {
        name: string;
        permissions: string[];
    }, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateRole(id: string, body: {
        name?: string;
        permissions?: string[];
    }, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    removeRole(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findAll(): Promise<{
        id: number;
        username: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        isActive: boolean;
        createdAt: Date;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        username: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        isActive: boolean;
        createdAt: Date;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    }>;
    create(body: any, req: any): Promise<{
        id: number;
        username: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        isActive: boolean;
        createdAt: Date;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    }>;
    update(id: string, body: any, req: any): Promise<{
        id: number;
        username: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        isActive: boolean;
        createdAt: Date;
        customRole: {
            id: number;
            name: string;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        username: string;
        password: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        customRoleId: number | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
