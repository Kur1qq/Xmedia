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
        };
    }>;
    findAll(): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
    }>;
    create(data: {
        username: string;
        password: string;
        role?: string;
        image?: string;
    }): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
    }>;
    update(id: number, data: {
        username?: string;
        password?: string;
        role?: string;
        image?: string;
        isActive?: boolean;
    }): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        username: string;
        createdAt: Date;
        updatedAt: Date;
        password: string;
        image: string | null;
        role: import("@prisma/client").$Enums.AdminRole;
        isActive: boolean;
    }>;
    seed(): Promise<void>;
}
