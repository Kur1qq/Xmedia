import { PrismaService } from '../prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        username: string;
        email: string;
        phone: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        username: string;
        email: string;
        phone: string | null;
    }>;
    create(data: {
        username: string;
        email: string;
        phone?: string;
        passwordHash: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        username: string;
        email: string;
        phone: string | null;
    }>;
    update(id: number, data: {
        username?: string;
        email?: string;
        phone?: string;
        passwordHash?: string;
    }): Promise<{
        id: number;
        updatedAt: Date;
        username: string;
        email: string;
        phone: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        username: string;
    }>;
}
