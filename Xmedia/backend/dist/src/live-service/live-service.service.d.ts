import { PrismaService } from '../prisma.service';
export declare class LiveServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        serviceType: ({
            subTypes: {
                id: number;
                name: string;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                mainTypeId: number;
            }[];
        } & {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        }) | null;
        subType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            mainTypeId: number;
        } | null;
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            cameraCount: number;
            liveServiceId: number;
            label: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
        }[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        serviceTypeId: number | null;
        subTypeId: number | null;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: number): Promise<{
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        serviceType: ({
            subTypes: {
                id: number;
                name: string;
                description: string | null;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                mainTypeId: number;
            }[];
        } & {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        }) | null;
        subType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            mainTypeId: number;
        } | null;
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            cameraCount: number;
            liveServiceId: number;
            label: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
        }[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        serviceTypeId: number | null;
        subTypeId: number | null;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: any): Promise<{
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        serviceType: {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        subType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            mainTypeId: number;
        } | null;
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            cameraCount: number;
            liveServiceId: number;
            label: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
        }[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        serviceTypeId: number | null;
        subTypeId: number | null;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, data: any): Promise<{
        category: {
            id: number;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        };
        serviceType: {
            id: number;
            name: string;
            description: string | null;
            isActive: boolean;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        subType: {
            id: number;
            name: string;
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            mainTypeId: number;
        } | null;
        priceTiers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            cameraCount: number;
            liveServiceId: number;
            label: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
        }[];
        equipments: ({
            equipment: {
                id: number;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.EquipmentType;
                images: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            liveServiceId: number;
            equipmentId: number;
        })[];
    } & {
        id: number;
        categoryId: number;
        serviceTypeId: number | null;
        subTypeId: number | null;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        categoryId: number;
        serviceTypeId: number | null;
        subTypeId: number | null;
        name: string;
        description: string | null;
        image: string | null;
        amenities: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
