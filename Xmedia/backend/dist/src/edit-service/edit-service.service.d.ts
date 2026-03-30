import { PrismaService } from '../prisma.service';
export declare class EditServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                sortOrder: number;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            editServiceId: number;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
            mainTypeId: number;
        } | null;
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        categoryId: number;
        subTypeId: number | null;
        mainTypeId: number;
    })[]>;
    findOne(id: number): Promise<{
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                sortOrder: number;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            editServiceId: number;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
            mainTypeId: number;
        } | null;
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        categoryId: number;
        subTypeId: number | null;
        mainTypeId: number;
    }>;
    create(data: any): Promise<{
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                sortOrder: number;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            editServiceId: number;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
            mainTypeId: number;
        } | null;
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        categoryId: number;
        subTypeId: number | null;
        mainTypeId: number;
    }>;
    update(id: number, data: any): Promise<{
        packages: ({
            subType: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                sortOrder: number;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            editServiceId: number;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            icon: string | null;
        };
        subType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
            mainTypeId: number;
        } | null;
        mainType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        categoryId: number;
        subTypeId: number | null;
        mainTypeId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        categoryId: number;
        subTypeId: number | null;
        mainTypeId: number;
    }>;
}
