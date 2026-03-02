import { CategoryService } from './category.service';
import { AdminLogService } from '../admin/admin-log.service';
export declare class CategoryController {
    private readonly categoryService;
    private readonly log;
    constructor(categoryService: CategoryService, log: AdminLogService);
    create(dto: {
        name: string;
        description?: string;
        icon?: string;
    }, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        icon: string | null;
    }>;
    findAll(): Promise<({
        subCategories: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            categoryId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        icon: string | null;
    })[]>;
    findOne(id: number): Promise<{
        subCategories: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            categoryId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        icon: string | null;
    }>;
    update(id: number, dto: {
        name?: string;
        description?: string;
        icon?: string;
    }, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        icon: string | null;
    }>;
    remove(id: number, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        icon: string | null;
    }>;
}
