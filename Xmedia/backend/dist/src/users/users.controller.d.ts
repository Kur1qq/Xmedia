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
