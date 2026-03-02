import { PrismaService } from '../prisma.service';
export declare class EditServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        packages: ({
            subType: {
                id: number;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            editServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        subType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            mainTypeId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        packages: ({
            subType: {
                id: number;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            editServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        subType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            mainTypeId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    create(data: any): Promise<{
        packages: ({
            subType: {
                id: number;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            editServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        subType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            mainTypeId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    update(id: number, data: any): Promise<{
        packages: ({
            subType: {
                id: number;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                mainTypeId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            editServiceId: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            subTypeId: number;
            priceLabel: string | null;
        })[];
        category: {
            id: number;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
        };
        mainType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        subType: {
            id: number;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            mainTypeId: number;
        } | null;
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        isActive: boolean;
        amenities: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: number;
        mainTypeId: number;
        subTypeId: number | null;
    }>;
}
