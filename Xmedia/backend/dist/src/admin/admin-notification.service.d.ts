import { PrismaService } from '../prisma.service';
export declare class AdminNotificationService {
    private prisma;
    constructor(prisma: PrismaService);
    getNotifications(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        message: string;
        isRead: boolean;
        referenceId: number | null;
    }[]>;
    createNotification(type: string, message: string, referenceId?: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        message: string;
        isRead: boolean;
        referenceId: number | null;
    }>;
    markAsRead(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        message: string;
        isRead: boolean;
        referenceId: number | null;
    }>;
    markAllAsRead(): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
