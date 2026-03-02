import { PrismaService } from '../prisma.service';
export declare class CategoryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        description?: string;
        icon?: string;
    }): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        icon: string | null;
    }>;
    findAll(): Promise<({
        subCategories: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            categoryId: number;
        }[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        icon: string | null;
    })[]>;
    findOne(id: number): Promise<{
        subCategories: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            categoryId: number;
        }[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        icon: string | null;
    }>;
    update(id: number, data: {
        name?: string;
        description?: string;
        icon?: string;
    }): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        icon: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        icon: string | null;
    }>;
}
