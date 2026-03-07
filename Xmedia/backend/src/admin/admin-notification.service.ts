import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminNotificationService {
    constructor(private prisma: PrismaService) { }

    // Get all notifications for the admin panel, ordered by newest first
    async getNotifications() {
        return this.prisma.adminNotification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50, // Keep it sane for the dropdown
        });
    }

    // Create a new notification
    async createNotification(type: string, message: string, referenceId?: number) {
        return this.prisma.adminNotification.create({
            data: {
                type,
                message,
                referenceId,
                isRead: false,
            }
        });
    }

    // Mark a specific notification as read
    async markAsRead(id: number) {
        const notification = await this.prisma.adminNotification.findUnique({ where: { id } });
        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }
        return this.prisma.adminNotification.update({
            where: { id },
            data: { isRead: true }
        });
    }

    // Mark all notifications as read
    async markAllAsRead() {
        return this.prisma.adminNotification.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });
    }
}
