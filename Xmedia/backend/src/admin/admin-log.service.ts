import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminLogService {
    constructor(private prisma: PrismaService) { }

    async log(adminId: number | undefined | null, action: string, entity?: string, entityId?: number, detail?: string, ip?: string) {
        // If no valid adminId (not authenticated), try to find who is admin (for system-side calls).
        // Fallback to admin id=1 (the seeded super admin). If that doesn't exist, skip the log.
        let resolvedId = adminId && adminId > 0 ? adminId : null;
        if (!resolvedId) {
            const first = await this.prisma.admin.findFirst({ where: { role: 'SUPER_ADMIN' }, select: { id: true } });
            if (!first) return;
            resolvedId = first.id;
        }
        return this.prisma.adminLog.create({
            data: { adminId: resolvedId, action, entity, entityId, detail, ip },
        });
    }

    async findAll(opts?: { adminId?: number; limit?: number; offset?: number }) {
        const where: any = {};
        if (opts?.adminId) where.adminId = opts.adminId;
        return this.prisma.adminLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: opts?.limit || 100,
            skip: opts?.offset || 0,
            include: { admin: { select: { id: true, username: true, image: true, role: true } } },
        });
    }

    async count(adminId?: number) {
        return this.prisma.adminLog.count({ where: adminId ? { adminId } : undefined });
    }
}
