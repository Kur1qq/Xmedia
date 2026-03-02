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
    update(id: number, dto: {
        name?: string;
        description?: string;
        icon?: string;
    }, req: any): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        icon: string | null;
    }>;
    remove(id: number, req: any): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        icon: string | null;
    }>;
}
