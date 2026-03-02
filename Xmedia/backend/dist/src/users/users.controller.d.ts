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
        createdAt: Date;
        username: string;
        email: string;
        phone: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        username: string;
        email: string;
        phone: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        username: string;
        email: string;
        phone: string | null;
    }>;
    update(id: string, body: {
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
    remove(id: string): Promise<{
        id: number;
        username: string;
    }>;
}
