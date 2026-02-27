import { PrismaService } from '../prisma.service';
export declare class EditTypeService {
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
            mainTypeId: number;
            sortOrder: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
    })[]>;
    createMainType(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
    }>;
    updateMainType(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
    }>;
    removeMainType(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        sortOrder: number;
    }>;
    createSubType(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        mainTypeId: number;
        sortOrder: number;
    }>;
    updateSubType(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        mainTypeId: number;
        sortOrder: number;
    }>;
    removeSubType(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        mainTypeId: number;
        sortOrder: number;
    }>;
}
