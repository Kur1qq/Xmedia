import { PrismaService } from '../prisma.service';
export declare class ServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        subCategory: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            categoryId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        priceUnit: string;
        durationMinutes: number | null;
        portfolioImages: string | null;
        categoryId: number;
        subCategoryId: number | null;
    }>;
    findAll(): Promise<({
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        subCategory: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            categoryId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        priceUnit: string;
        durationMinutes: number | null;
        portfolioImages: string | null;
        categoryId: number;
        subCategoryId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        subCategory: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            categoryId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        priceUnit: string;
        durationMinutes: number | null;
        portfolioImages: string | null;
        categoryId: number;
        subCategoryId: number | null;
    }>;
    update(id: number, data: any): Promise<{
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        subCategory: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            categoryId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        priceUnit: string;
        durationMinutes: number | null;
        portfolioImages: string | null;
        categoryId: number;
        subCategoryId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        priceUnit: string;
        durationMinutes: number | null;
        portfolioImages: string | null;
        categoryId: number;
        subCategoryId: number | null;
    }>;
}
