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
        username: string;
        email: string;
        phone: string | null;
        createdAt: Date;
        id: number;
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
        username: string;
        email: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    findAll(): Promise<{
        username: string;
        email: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    findOne(id: string): Promise<{
        username: string;
        email: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    update(id: string, body: {
        username?: string;
        email?: string;
        phone?: string;
        passwordHash?: string;
    }): Promise<{
        username: string;
        email: string;
        phone: string | null;
        updatedAt: Date;
        id: number;
    }>;
    remove(id: string): void;
}
