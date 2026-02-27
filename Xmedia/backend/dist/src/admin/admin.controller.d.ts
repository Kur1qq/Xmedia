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
    findAll(): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
    }>;
    create(body: any, req: any): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
    }>;
    update(id: string, body: any, req: any): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        updatedAt: Date;
        password: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
    }>;
}
