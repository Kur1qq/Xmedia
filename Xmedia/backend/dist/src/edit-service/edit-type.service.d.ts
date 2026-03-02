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
            description: string | null;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            mainTypeId: number;
        }[];
    } & {
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    })[]>;
    createMainType(data: any): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
    updateMainType(id: number, data: any): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
    removeMainType(id: number): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
    createSubType(data: any): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        mainTypeId: number;
    }>;
    updateSubType(id: number, data: any): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        mainTypeId: number;
    }>;
    removeSubType(id: number): Promise<{
        id: number;
        description: string | null;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        mainTypeId: number;
    }>;
}
