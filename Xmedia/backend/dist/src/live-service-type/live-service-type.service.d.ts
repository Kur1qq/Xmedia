import { PrismaService } from '../prisma.service';
export declare class LiveServiceTypeService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllMainTypes(): Promise<({
        _count: {
            services: number;
        };
        subTypes: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            sortOrder: number;
            mainTypeId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        sortOrder: number;
    })[]>;
    createMainType(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        sortOrder: number;
    }>;
    updateMainType(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        sortOrder: number;
    }>;
    removeMainType(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        sortOrder: number;
    }>;
    findSubTypesByMain(mainTypeId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
        mainTypeId: number;
    }[]>;
    createSubType(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
        mainTypeId: number;
    }>;
    updateSubType(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
        mainTypeId: number;
    }>;
    removeSubType(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
        mainTypeId: number;
    }>;
}
