import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(body: {
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
    checkEmail(body: {
        email: string;
    }): Promise<{
        exists: boolean;
    }>;
    resetPassword(body: {
        email: string;
        passwordHash: string;
    }): Promise<{
        success: boolean;
    }>;
    login(body: {
        email: string;
        passwordHash: string;
    }): Promise<{
        id: number;
        username: string;
        email: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: number;
        username: string;
        email: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        username: string;
        email: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, body: {
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
    remove(id: string): Promise<{
        id: number;
        username: string;
    }>;
}
