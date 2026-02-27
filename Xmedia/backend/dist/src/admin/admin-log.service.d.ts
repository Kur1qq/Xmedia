import { PrismaService } from '../prisma.service';
export declare class AdminLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(adminId: number | undefined | null, action: string, entity?: string, entityId?: number, detail?: string, ip?: string): Promise<{
        id: number;
        createdAt: Date;
        action: string;
        entity: string | null;
        entityId: number | null;
        detail: string | null;
        ip: string | null;
        adminId: number | null;
    } | undefined>;
    findAll(opts?: {
        adminId?: number;
        limit?: number;
        offset?: number;
    }): Promise<({
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
    count(adminId?: number): Promise<number>;
}
