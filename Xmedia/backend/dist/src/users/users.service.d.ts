import { PrismaService } from '../prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        username: string;
        email: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        username: string;
        email: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: {
        username: string;
        email: string;
        phone?: string;
        passwordHash: string;
    }): Promise<{
        id: number;
        username: string;
        email: string;
        phone: string | null;
        createdAt: Date;
    }>;
    update(id: number, data: {
        username?: string;
        email?: string;
        phone?: string;
        passwordHash?: string;
    }): Promise<{
        id: number;
        username: string;
        email: string;
        phone: string | null;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        username: string;
    }>;
}
