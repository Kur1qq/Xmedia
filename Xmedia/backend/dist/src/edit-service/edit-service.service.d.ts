import { PrismaService } from '../prisma.service';
export declare class EditServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            mainTypeId: number;
            sortOrder: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        priceUnit: string;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
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
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            mainTypeId: number;
            sortOrder: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        priceUnit: string;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    create(data: any): Promise<{
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            mainTypeId: number;
            sortOrder: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        priceUnit: string;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
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
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            mainTypeId: number;
            sortOrder: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        priceUnit: string;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        priceUnit: string;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
}
