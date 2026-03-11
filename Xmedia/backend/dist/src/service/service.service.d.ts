import { PrismaService } from '../prisma.service';
export declare class ServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        subCategory: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            categoryId: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        priceUnit: string;
        durationMinutes: number | null;
        portfolioImages: string | null;
        categoryId: number;
        subCategoryId: number | null;
    }>;
    findAll(): Promise<({
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        subCategory: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            categoryId: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        priceUnit: string;
        durationMinutes: number | null;
        portfolioImages: string | null;
        categoryId: number;
        subCategoryId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        subCategory: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            categoryId: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        priceUnit: string;
        durationMinutes: number | null;
        portfolioImages: string | null;
        categoryId: number;
        subCategoryId: number | null;
    }>;
    update(id: number, data: any): Promise<{
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        subCategory: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            categoryId: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        priceUnit: string;
        durationMinutes: number | null;
        portfolioImages: string | null;
        categoryId: number;
        subCategoryId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        priceUnit: string;
        durationMinutes: number | null;
        portfolioImages: string | null;
        categoryId: number;
        subCategoryId: number | null;
    }>;
}
